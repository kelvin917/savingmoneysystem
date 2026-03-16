"use client";

import { useState } from "react";
import { actionDepositToGoal } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DepositForm({ goalId }: { goalId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("id", String(goalId));
    await actionDepositToGoal(fd);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="存入金额"
        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "..." : "存入"}
      </button>
    </form>
  );
}
