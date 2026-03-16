import { getSummary, getTransactions } from "@/lib/db";
import AddTransactionForm from "@/components/AddTransactionForm";
import Link from "next/link";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HomePage() {
  const summary = getSummary();
  const recent = getTransactions(undefined, 5);
  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总收入</p>
          <p className="text-2xl font-bold text-emerald-600">¥{fmt(summary.totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总支出</p>
          <p className="text-2xl font-bold text-red-500">¥{fmt(summary.totalExpense)}</p>
        </div>
        <div className={`rounded-xl border p-5 ${balancePositive ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <p className="text-sm text-gray-500 mb-1">当前余额</p>
          <p className={`text-2xl font-bold ${balancePositive ? "text-emerald-700" : "text-red-600"}`}>
            {balancePositive ? "" : "-"}¥{fmt(Math.abs(summary.balance))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Transaction */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">快速记账</h2>
          <AddTransactionForm />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">最近记录</h2>
            <Link href="/transactions" className="text-sm text-blue-600 hover:underline">查看全部</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">暂无记录</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.type === "income" ? "bg-emerald-500" : "bg-red-400"}`} />
                    <span className="text-gray-700">{tx.category}</span>
                    {tx.note && <span className="text-gray-400 truncate max-w-[80px]">{tx.note}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.type === "income" ? "+" : "-"}¥{fmt(tx.amount)}
                    </span>
                    <span className="text-gray-400">{tx.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
