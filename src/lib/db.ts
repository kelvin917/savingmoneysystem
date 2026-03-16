import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "finance.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      type      TEXT    NOT NULL CHECK(type IN ('income','expense')),
      amount    REAL    NOT NULL CHECK(amount > 0),
      category  TEXT    NOT NULL,
      note      TEXT    DEFAULT '',
      date      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT  NOT NULL,
      target     REAL  NOT NULL CHECK(target > 0),
      saved      REAL  NOT NULL DEFAULT 0,
      deadline   TEXT  DEFAULT '',
      created_at TEXT  NOT NULL
    );
  `);
}

// ─── Types ────────────────────────────────────────────────────

export type TxType = "income" | "expense";

export interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  created_at: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

// ─── Transactions ─────────────────────────────────────────────

export function addTransaction(
  type: TxType,
  amount: number,
  category: string,
  note: string,
  date: string
): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO transactions (type, amount, category, note, date) VALUES (?,?,?,?,?)"
  ).run(type, amount, category, note, date);
}

export function getTransactions(
  type?: TxType,
  limit?: number
): Transaction[] {
  const db = getDb();
  let sql = "SELECT * FROM transactions";
  const params: unknown[] = [];
  if (type) {
    sql += " WHERE type = ?";
    params.push(type);
  }
  sql += " ORDER BY date DESC, id DESC";
  if (limit) sql += ` LIMIT ${limit}`;
  return db.prepare(sql).all(...params) as Transaction[];
}

export function deleteTransaction(id: number): void {
  getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

export function getSummary(): Summary {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END),0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS totalExpense
       FROM transactions`
    )
    .get() as { totalIncome: number; totalExpense: number };
  return {
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance: row.totalIncome - row.totalExpense,
  };
}

export function getCategoryStats(
  type: TxType
): { category: string; total: number }[] {
  return getDb()
    .prepare(
      "SELECT category, SUM(amount) AS total FROM transactions WHERE type=? GROUP BY category ORDER BY total DESC"
    )
    .all(type) as { category: string; total: number }[];
}

// ─── Savings Goals ────────────────────────────────────────────

export function addGoal(
  name: string,
  target: number,
  deadline: string
): void {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    "INSERT INTO savings_goals (name, target, saved, deadline, created_at) VALUES (?,?,0,?,?)"
  ).run(name, target, deadline, today);
}

export function getGoals(): SavingsGoal[] {
  return getDb()
    .prepare("SELECT * FROM savings_goals ORDER BY id")
    .all() as SavingsGoal[];
}

export function depositToGoal(id: number, amount: number): void {
  getDb()
    .prepare(
      "UPDATE savings_goals SET saved = MIN(saved + ?, target) WHERE id = ?"
    )
    .run(amount, id);
}

export function deleteGoal(id: number): void {
  getDb().prepare("DELETE FROM savings_goals WHERE id = ?").run(id);
}
