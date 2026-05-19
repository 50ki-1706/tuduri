/**
 * ログテーブルへのデータアクセスを担当するリポジトリ層
 * Drizzle ORM を用いた DB 操作のみを含む
 */
import { and, desc, eq, gte, lt } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "@/db/schema";
import { logs } from "@/db/schema";

/** Drizzle データベースインスタンスの型 */
type Database = LibSQLDatabase<typeof schema>;

/**
 * 指定ユーザーの最新ログ1件を取得する
 * @param db - Drizzle データベースインスタンス
 * @param userId - ユーザーID
 * @returns 最新ログの id、存在しない場合は null
 */
export async function findLatestByUserId(
  db: Database,
  userId: string,
): Promise<{ id: string } | null> {
  const [result] = await db
    .select({ id: logs.id })
    .from(logs)
    .where(eq(logs.userId, userId))
    .orderBy(desc(logs.createdAt))
    .limit(1);
  return result ?? null;
}

/** ログ挿入時のパラメータ */
export interface InsertLogParams {
  id: string;
  userId: string;
  author: string;
  message: string;
  parent: string | null;
  createdAt: Date;
}

/**
 * 新しいログを1件挿入する
 * @param db - Drizzle データベースインスタンス
 * @param log - 挿入するログデータ
 * @returns 挿入されたログレコード
 */
export async function insertLog(db: Database, log: InsertLogParams) {
  const [result] = await db.insert(logs).values(log).returning();
  if (!result) {
    throw new Error("Failed to insert log");
  }
  return result;
}

/**
 * 指定ユーザー・指定日付のログ一覧を降順で取得する
 * 日付は UTC 基準で解釈する
 * @param db - Drizzle データベースインスタンス
 * @param userId - ユーザーID
 * @param date - YYYY-MM-DD 形式の日付文字列
 * @returns ログレコードの配列
 */
export async function findByUserIdAndDate(
  db: Database,
  userId: string,
  date: string,
) {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T00:00:00.000Z`);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  return db
    .select()
    .from(logs)
    .where(
      and(
        eq(logs.userId, userId),
        gte(logs.createdAt, startOfDay),
        lt(logs.createdAt, endOfDay),
      ),
    )
    .orderBy(desc(logs.createdAt));
}

/**
 * 指定ユーザーの全ログを降順で取得する
 * @param db - Drizzle データベースインスタンス
 * @param userId - ユーザーID
 * @returns ログレコードの配列
 */
export async function findAllByUserId(db: Database, userId: string) {
  return db
    .select()
    .from(logs)
    .where(eq(logs.userId, userId))
    .orderBy(desc(logs.createdAt));
}
