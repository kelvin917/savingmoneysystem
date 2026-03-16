"use server";

import { revalidatePath } from "next/cache";
import * as db from "./db";
import type { TxType } from "./db";

// ─── Transactions ─────────────────────────────────────────────

export async function actionAddTransaction(formData: FormData) {
  const type = formData.get("type") as TxType;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const note = (formData.get("note") as string) ?? "";
  const date = formData.get("date") as string;

  if (!type || isNaN(amount) || amount <= 0 || !category || !date) return;

  db.addTransaction(type, amount, category, note, date);
  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function actionDeleteTransaction(id: number) {
  db.deleteTransaction(id);
  revalidatePath("/");
  revalidatePath("/transactions");
}

// ─── Savings Goals ────────────────────────────────────────────

export async function actionAddGoal(formData: FormData) {
  const name = formData.get("name") as string;
  const target = parseFloat(formData.get("target") as string);
  const deadline = (formData.get("deadline") as string) ?? "";

  if (!name || isNaN(target) || target <= 0) return;

  db.addGoal(name, target, deadline);
  revalidatePath("/savings");
}

export async function actionDepositToGoal(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const amount = parseFloat(formData.get("amount") as string);

  if (isNaN(id) || isNaN(amount) || amount <= 0) return;

  db.depositToGoal(id, amount);
  revalidatePath("/savings");
}

export async function actionDeleteGoal(id: number) {
  db.deleteGoal(id);
  revalidatePath("/savings");
}
