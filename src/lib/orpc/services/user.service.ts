/**
 * ユーザー操作に関するビジネスロジックを担当するサービス層
 * リポジトリ層を呼び出し、ビジネスルールを適用する
 */
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "@/db/schema";
import * as userRepo from "@/lib/orpc/repositories/user.repository";

/** Drizzle データベースインスタンスの型 */
type Database = LibSQLDatabase<typeof schema>;

/**
 * ユーザー名を更新する
 * @param db - Drizzle データベースインスタンス
 * @param userId - 更新対象のユーザーID
 * @param name - 新しいユーザー名
 * @returns 更新されたユーザーレコード
 */
export async function updateUserName(
  db: Database,
  userId: string,
  name: string,
) {
  return userRepo.updateName(db, userId, name);
}
