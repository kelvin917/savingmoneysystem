import { getTransactions } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";
import AddTransactionForm from "@/components/AddTransactionForm";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TransactionsPage() {
  const transactions = getTransactions();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">添加记录</h2>
          <AddTransactionForm />
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            全部记录
            <span className="ml-2 text-sm font-normal text-gray-400">({transactions.length} 条)</span>
          </h2>

          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">暂无记录，从左侧添加吧</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-left">
                    <th className="pb-2 font-medium">日期</th>
                    <th className="pb-2 font-medium">类型</th>
                    <th className="pb-2 font-medium">类别</th>
                    <th className="pb-2 font-medium">备注</th>
                    <th className="pb-2 font-medium text-right">金额</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 text-gray-500">{tx.date}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "income" ? "收入" : "支出"}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-700">{tx.category}</td>
                      <td className="py-2.5 text-gray-400 max-w-[120px] truncate">{tx.note}</td>
                      <td className={`py-2.5 text-right font-medium ${
                        tx.type === "income" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}¥{fmt(tx.amount)}
                      </td>
                      <td className="py-2.5 pl-3">
                        <DeleteButton id={tx.id} type="transaction" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
