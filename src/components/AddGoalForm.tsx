"use client";

import { useState } from "react";
import { actionAddGoal } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AddGoalForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await actionAddGoal(new FormData(e.currentTarget));
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name"
        required
        placeholder="目标名称（如：买车、旅游）"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <input
        name="target"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="目标金额 (¥)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div>
        <label className="block text-xs text-gray-500 mb-1">截止日期（可选）</label>
        <input
          name="deadline"
          type="date"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {loading ? "创建中..." : "创建目标"}
      </button>
    </form>
  );
}
