import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "finance.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS transactions (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            type      TEXT    NOT NULL CHECK(type IN ('income','expense')),
            amount    REAL    NOT NULL CHECK(amount > 0),
            category  TEXT    NOT NULL,
            note      TEXT,
            date      TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS savings_goals (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            target      REAL    NOT NULL CHECK(target > 0),
            saved       REAL    NOT NULL DEFAULT 0,
            deadline    TEXT,
            created_at  TEXT    NOT NULL
        );
    """)
    conn.commit()
    conn.close()


# ---------- Transactions ----------

def add_transaction(type_: str, amount: float, category: str, note: str, date: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO transactions (type, amount, category, note, date) VALUES (?,?,?,?,?)",
        (type_, amount, category, note, date),
    )
    conn.commit()
    conn.close()


def get_transactions(limit: int = None, type_filter: str = None):
    conn = get_conn()
    sql = "SELECT * FROM transactions"
    params = []
    if type_filter:
        sql += " WHERE type = ?"
        params.append(type_filter)
    sql += " ORDER BY date DESC, id DESC"
    if limit:
        sql += f" LIMIT {limit}"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return rows


def get_summary():
    conn = get_conn()
    row = conn.execute("""
        SELECT
            COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions
    """).fetchone()
    conn.close()
    return dict(row)


def get_category_stats(type_: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT category, SUM(amount) AS total FROM transactions WHERE type=? GROUP BY category ORDER BY total DESC",
        (type_,),
    ).fetchall()
    conn.close()
    return rows


def delete_transaction(tx_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM transactions WHERE id=?", (tx_id,))
    conn.commit()
    conn.close()


# ---------- Savings Goals ----------

def add_goal(name: str, target: float, deadline: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO savings_goals (name, target, saved, deadline, created_at) VALUES (?,?,0,?,?)",
        (name, target, deadline or "", datetime.now().strftime("%Y-%m-%d")),
    )
    conn.commit()
    conn.close()


def get_goals():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM savings_goals ORDER BY id").fetchall()
    conn.close()
    return rows


def deposit_to_goal(goal_id: int, amount: float):
    conn = get_conn()
    conn.execute(
        "UPDATE savings_goals SET saved = MIN(saved + ?, target) WHERE id=?",
        (amount, goal_id),
    )
    conn.commit()
    conn.close()


def delete_goal(goal_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM savings_goals WHERE id=?", (goal_id,))
    conn.commit()
    conn.close()
