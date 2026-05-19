/**
 * ログ操作に関するビジネスロジックを担当するサービス層
 * リポジトリ層を呼び出し、ビジネスルールを適用する
 */
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "@/db/schema";
import * as logRepo from "@/lib/orpc/repositories/log.repository";

/** Drizzle データベースインスタンスの型 */
type Database = LibSQLDatabase<typeof schema>;

/**
 * 新しいログを作成する
 * UUID v4 を生成し、同一ユーザーの直前ログを parent として設定する
 * 著者名は作成時点のスナップショットとして保存する
 * @param db - Drizzle データベースインスタンス
 * @param userId - ログ作成者のユーザーID
 * @param authorName - 作成時点のユーザー名（null/undefined の場合は "Unknown"）
 * @param message - ログの本文
 * @returns 作成されたログレコード
 */
export async function createLog(
  db: Database,
  userId: string,
  authorName: string | null | undefined,
  message: string,
) {
  const id = crypto.randomUUID();
  const previous = await logRepo.findLatestByUserId(db, userId);
  const author = authorName || "Unknown";

  return logRepo.insertLog(db, {
    id,
    userId,
    author,
    message,
    parent: previous?.id ?? null,
    createdAt: new Date(),
  });
}

/**
 * 指定ユーザーのログ一覧を取得する
 * 日付指定時は UTC 基準でその日のログのみを返す
 * @param db - Drizzle データベースインスタンス
 * @param userId - ログ所有者のユーザーID
 * @param date - YYYY-MM-DD 形式の日付文字列（省略可）
 * @returns ログレコードの配列（降順）
 */
export async function listLogs(db: Database, userId: string, date?: string) {
  if (date) {
    return logRepo.findByUserIdAndDate(db, userId, date);
  }
  return logRepo.findAllByUserId(db, userId);
}
