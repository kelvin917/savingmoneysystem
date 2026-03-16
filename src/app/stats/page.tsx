import { getCategoryStats, getSummary } from "@/lib/db";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CategoryTable({
  title,
  rows,
  total,
  colorClass,
}: {
  title: string;
  rows: { category: string; total: number }[];
  total: number;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">暂无数据</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const pct = total > 0 ? (r.total / total) * 100 : 0;
            return (
              <div key={r.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{r.category}</span>
                  <span className="text-gray-500">
                    ¥{fmt(r.total)} <span className="text-gray-400">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  const summary = getSummary();
  const incomeStats  = getCategoryStats("income");
  const expenseStats = getCategoryStats("expense");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总收入</p>
          <p className="text-xl font-bold text-emerald-600">¥{fmt(summary.totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">总支出</p>
          <p className="text-xl font-bold text-red-500">¥{fmt(summary.totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryTable
          title="收入分类"
          rows={incomeStats}
          total={summary.totalIncome}
          colorClass="bg-emerald-400"
        />
        <CategoryTable
          title="支出分类"
          rows={expenseStats}
          total={summary.totalExpense}
          colorClass="bg-red-400"
        />
      </div>
    </div>
  );
}
