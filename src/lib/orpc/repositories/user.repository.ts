/**
 * ユーザーテーブルへのデータアクセスを担当するリポジトリ層
 * Drizzle ORM を用いた DB 操作のみを含む
 */
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "@/db/schema";
import { user } from "@/db/schema";

/** Drizzle データベースインスタンスの型 */
type Database = LibSQLDatabase<typeof schema>;

/**
 * ユーザー名を更新する
 * @param db - Drizzle データベースインスタンス
 * @param userId - 更新対象のユーザーID
 * @param name - 新しいユーザー名
 * @returns 更新されたユーザーレコード
 * @throws ユーザーが見つからない場合にエラー
 */
export async function updateName(db: Database, userId: string, name: string) {
  const [result] = await db
    .update(user)
    .set({ name })
    .where(eq(user.id, userId))
    .returning();
  if (!result) {
    throw new Error("User not found");
  }
  return result;
}
