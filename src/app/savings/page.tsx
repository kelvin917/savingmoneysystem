import { getGoals } from "@/lib/db";
import AddGoalForm from "@/components/AddGoalForm";
import DepositForm from "@/components/DepositForm";
import DeleteButton from "@/components/DeleteButton";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SavingsPage() {
  const goals = getGoals();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">新建目标</h2>
          <AddGoalForm />
        </div>

        <div className="md:col-span-2 space-y-4">
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
              还没有储蓄目标，从左侧新建吧
            </div>
          ) : (
            goals.map((goal) => {
              const pct = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
              const pctInt = Math.round(pct * 100);
              const done = pct >= 1;
              return (
                <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                        {done && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ 已完成
                          </span>
                        )}
                      </div>
                      {goal.deadline && (
                        <p className="text-xs text-gray-400 mt-0.5">截止：{goal.deadline}</p>
                      )}
                    </div>
                    <DeleteButton id={goal.id} type="goal" />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">
                      ¥{fmt(goal.saved)} / ¥{fmt(goal.target)}
                    </span>
                    <span className={`font-medium ${done ? "text-emerald-600" : pct >= 0.5 ? "text-yellow-600" : "text-gray-500"}`}>
                      {pctInt}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${done ? "bg-emerald-500" : pct >= 0.5 ? "bg-yellow-400" : "bg-blue-400"}`}
                      style={{ width: `${pctInt}%` }}
                    />
                  </div>

                  {!done && <DepositForm goalId={goal.id} />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
