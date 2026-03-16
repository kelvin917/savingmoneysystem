"use client";

import { useState } from "react";
import { actionAddTransaction } from "@/lib/actions";
import { useRouter } from "next/navigation";

const INCOME_CATS  = ["工资", "奖金", "投资", "兼职", "其他收入"];
const EXPENSE_CATS = ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "教育", "其他支出"];

export default function AddTransactionForm() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const categories = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    await actionAddTransaction(fd);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              type === t
                ? t === "income"
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === "income" ? "收入" : "支出"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="金额"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Category */}
      <select
        name="category"
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
      >
        <option value="">选择类别</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Note */}
      <input
        name="note"
        type="text"
        placeholder="备注（可选）"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Date */}
      <input
        name="date"
        type="date"
        defaultValue={today}
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
          type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {loading ? "保存中..." : "记录"}
      </button>
    </form>
  );
}
