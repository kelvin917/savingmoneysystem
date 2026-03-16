"use client";

import { useRouter } from "next/navigation";
import { actionDeleteTransaction, actionDeleteGoal } from "@/lib/actions";

interface Props {
  id: number;
  type: "transaction" | "goal";
}

export default function DeleteButton({ id, type }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("确认删除？")) return;
    if (type === "transaction") {
      await actionDeleteTransaction(id);
    } else {
      await actionDeleteGoal(id);
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1"
      title="删除"
    >
      ✕
    </button>
  );
}
