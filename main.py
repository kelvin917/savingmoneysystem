#!/usr/bin/env python3
"""
个人做账 & 储蓄系统
Personal Accounting & Savings System
"""
import sys
from datetime import datetime

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.prompt import Prompt, FloatPrompt, Confirm
    from rich import box
    from rich.progress import BarColumn, Progress, TextColumn
    from rich.text import Text
except ImportError:
    print("请先安装依赖: pip install rich")
    sys.exit(1)

import db

console = Console()

INCOME_CATEGORIES  = ["工资", "奖金", "投资", "兼职", "其他收入"]
EXPENSE_CATEGORIES = ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "教育", "其他支出"]


# ─────────────────────────── helpers ────────────────────────────

def fmt_amount(amount: float, color: str = "white") -> Text:
    return Text(f"¥{amount:,.2f}", style=color)


def pick_from_list(prompt: str, items: list[str]) -> str:
    for i, item in enumerate(items, 1):
        console.print(f"  [{i}] {item}")
    while True:
        raw = Prompt.ask(prompt)
        if raw.isdigit() and 1 <= int(raw) <= len(items):
            return items[int(raw) - 1]
        console.print("[red]请输入有效编号[/red]")


def today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


# ─────────────────────────── overview ───────────────────────────

def show_overview():
    summary = db.get_summary()
    income  = summary["total_income"]
    expense = summary["total_expense"]
    balance = income - expense

    balance_color = "green" if balance >= 0 else "red"

    panel_text = (
        f"[bold cyan]总收入[/bold cyan]   ¥{income:>12,.2f}\n"
        f"[bold red]总支出[/bold red]   ¥{expense:>12,.2f}\n"
        f"[bold {balance_color}]当前余额[/bold {balance_color}]  ¥{balance:>12,.2f}"
    )
    console.print(Panel(panel_text, title="[bold]财务概览", border_style="blue", padding=(1, 4)))


# ─────────────────────────── transactions ───────────────────────

def add_income():
    console.print("\n[bold cyan]── 添加收入 ──[/bold cyan]")
    console.print("选择收入类别:")
    category = pick_from_list("类别编号", INCOME_CATEGORIES)
    amount   = FloatPrompt.ask("金额 (¥)")
    while amount <= 0:
        console.print("[red]金额必须大于 0[/red]")
        amount = FloatPrompt.ask("金额 (¥)")
    note = Prompt.ask("备注 (可留空)", default="")
    date = Prompt.ask("日期 (YYYY-MM-DD)", default=today())
    db.add_transaction("income", amount, category, note, date)
    console.print(f"[green]✓ 已记录收入 ¥{amount:,.2f} [{category}][/green]")


def add_expense():
    console.print("\n[bold red]── 添加支出 ──[/bold red]")
    console.print("选择支出类别:")
    category = pick_from_list("类别编号", EXPENSE_CATEGORIES)
    amount   = FloatPrompt.ask("金额 (¥)")
    while amount <= 0:
        console.print("[red]金额必须大于 0[/red]")
        amount = FloatPrompt.ask("金额 (¥)")
    note = Prompt.ask("备注 (可留空)", default="")
    date = Prompt.ask("日期 (YYYY-MM-DD)", default=today())
    db.add_transaction("expense", amount, category, note, date)
    console.print(f"[green]✓ 已记录支出 ¥{amount:,.2f} [{category}][/green]")


def show_transactions():
    console.print("\n选择查看类型: [1] 全部  [2] 仅收入  [3] 仅支出")
    choice = Prompt.ask("选择", choices=["1", "2", "3"], default="1")
    type_filter = {"1": None, "2": "income", "3": "expense"}[choice]

    limit_str = Prompt.ask("显示最近多少条 (直接回车=全部)", default="")
    limit = int(limit_str) if limit_str.isdigit() else None

    rows = db.get_transactions(limit=limit, type_filter=type_filter)
    if not rows:
        console.print("[yellow]暂无记录[/yellow]")
        return

    table = Table(box=box.ROUNDED, show_header=True, header_style="bold magenta")
    table.add_column("ID",     style="dim",    width=5)
    table.add_column("类型",   width=6)
    table.add_column("金额",   justify="right", width=12)
    table.add_column("类别",   width=10)
    table.add_column("备注",   width=20)
    table.add_column("日期",   width=12)

    for r in rows:
        type_label = "[cyan]收入[/cyan]" if r["type"] == "income" else "[red]支出[/red]"
        amount_str = f"[cyan]¥{r['amount']:,.2f}[/cyan]" if r["type"] == "income" else f"[red]¥{r['amount']:,.2f}[/red]"
        table.add_row(str(r["id"]), type_label, amount_str, r["category"], r["note"] or "", r["date"])

    console.print(table)


def delete_transaction():
    show_transactions()
    tx_id_str = Prompt.ask("\n输入要删除的记录 ID (回车取消)", default="")
    if not tx_id_str.isdigit():
        return
    if Confirm.ask(f"确认删除 ID={tx_id_str}?"):
        db.delete_transaction(int(tx_id_str))
        console.print("[green]✓ 已删除[/green]")


def show_category_stats():
    console.print("\n[bold]── 分类统计 ──[/bold]")
    for type_, label, color in [("income", "收入", "cyan"), ("expense", "支出", "red")]:
        rows = db.get_category_stats(type_)
        if not rows:
            continue
        total = sum(r["total"] for r in rows)
        table = Table(title=f"{label}分类汇总", box=box.SIMPLE_HEAVY, header_style=f"bold {color}")
        table.add_column("类别", width=12)
        table.add_column("金额", justify="right", width=14)
        table.add_column("占比", justify="right", width=8)
        for r in rows:
            pct = r["total"] / total * 100 if total else 0
            table.add_row(r["category"], f"¥{r['total']:,.2f}", f"{pct:.1f}%")
        console.print(table)


# ─────────────────────────── savings goals ──────────────────────

def show_goals():
    goals = db.get_goals()
    if not goals:
        console.print("[yellow]暂无储蓄目标[/yellow]")
        return

    for g in goals:
        pct      = g["saved"] / g["target"] if g["target"] else 0
        pct_int  = int(pct * 100)
        bar_done = int(pct * 30)
        bar      = "█" * bar_done + "░" * (30 - bar_done)
        color    = "green" if pct >= 1 else "yellow" if pct >= 0.5 else "red"
        status   = "✓ 已完成" if pct >= 1 else f"{pct_int}%"
        deadline = f"  截止: {g['deadline']}" if g["deadline"] else ""
        console.print(
            f"[bold][{g['id']}] {g['name']}[/bold]{deadline}\n"
            f"    [{color}]{bar}[/{color}] {status}  "
            f"¥{g['saved']:,.2f} / ¥{g['target']:,.2f}\n"
        )


def add_goal():
    console.print("\n[bold green]── 新建储蓄目标 ──[/bold green]")
    name     = Prompt.ask("目标名称")
    target   = FloatPrompt.ask("目标金额 (¥)")
    deadline = Prompt.ask("截止日期 (YYYY-MM-DD, 可留空)", default="")
    db.add_goal(name, target, deadline)
    console.print(f"[green]✓ 目标「{name}」已创建，目标金额 ¥{target:,.2f}[/green]")


def deposit_goal():
    show_goals()
    goal_id_str = Prompt.ask("\n输入要存入的目标 ID (回车取消)", default="")
    if not goal_id_str.isdigit():
        return
    amount = FloatPrompt.ask("存入金额 (¥)")
    db.deposit_to_goal(int(goal_id_str), amount)
    console.print(f"[green]✓ 已存入 ¥{amount:,.2f}[/green]")


def delete_goal_menu():
    show_goals()
    goal_id_str = Prompt.ask("\n输入要删除的目标 ID (回车取消)", default="")
    if not goal_id_str.isdigit():
        return
    if Confirm.ask(f"确认删除目标 ID={goal_id_str}?"):
        db.delete_goal(int(goal_id_str))
        console.print("[green]✓ 已删除[/green]")


# ─────────────────────────── menus ──────────────────────────────

MENU = """
[bold blue]═══════════════════════════════════[/bold blue]
[bold]       个人做账 & 储蓄系统[/bold]
[bold blue]═══════════════════════════════════[/bold blue]
 [cyan]1[/cyan]  财务概览（余额）
 [cyan]2[/cyan]  添加收入
 [cyan]3[/cyan]  添加支出
 [cyan]4[/cyan]  查看交易记录
 [cyan]5[/cyan]  删除交易记录
 [cyan]6[/cyan]  分类统计
[bold blue]───────────────────────────────────[/bold blue]
 [green]7[/green]  查看储蓄目标
 [green]8[/green]  新建储蓄目标
 [green]9[/green]  向目标存入资金
 [green]10[/green] 删除储蓄目标
[bold blue]───────────────────────────────────[/bold blue]
 [dim]0  退出[/dim]
"""

ACTIONS = {
    "1":  show_overview,
    "2":  add_income,
    "3":  add_expense,
    "4":  show_transactions,
    "5":  delete_transaction,
    "6":  show_category_stats,
    "7":  show_goals,
    "8":  add_goal,
    "9":  deposit_goal,
    "10": delete_goal_menu,
}


def main():
    db.init_db()
    console.clear()
    while True:
        console.print(MENU)
        choice = Prompt.ask("请选择功能", default="1")
        if choice == "0":
            console.print("[dim]再见！[/dim]")
            break
        action = ACTIONS.get(choice)
        if action:
            action()
        else:
            console.print("[red]无效选项，请重新选择[/red]")
        console.print()
        input("按 Enter 继续...")
        console.clear()


if __name__ == "__main__":
    main()
