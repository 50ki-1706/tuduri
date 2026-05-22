/**
 * ログ操作に関する zod バリデーションスキーマ
 * クライアント・サーバー両方で共有する
 */
import { z } from "zod";
import { LOG_MESSAGE_MAX_LENGTH } from "@/constants/log";

/** ログ作成時のバリデーションスキーマ */
export const createLogSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "メッセージを入力してください")
    .max(
      LOG_MESSAGE_MAX_LENGTH,
      `${LOG_MESSAGE_MAX_LENGTH}文字以内で入力してください`,
    )
    .describe("ログの本文"),
});

/** ログ一覧取得時のバリデーションスキーマ */
export const listLogsSchema = z.object({
  date: z
    .string()
    .date("日付形式が正しくありません（YYYY-MM-DD）")
    .optional()
    .describe("取得する日付（YYYY-MM-DD形式、UTC基準）。省略時は全件取得"),
});

/** ログ一覧取得時の出力スキーマ */
export const logEntrySchema = z.object({
  id: z.string().uuid().describe("ログの一意ID（UUID v4）"),
  author: z.string().describe("作成時点のユーザー名"),
  message: z.string().describe("ログの本文"),
  parent: z
    .string()
    .uuid()
    .nullable()
    .describe("親ログのID（チェーン構造）。初回ログはnull"),
  createdAt: z.string().datetime().describe("作成日時（ISO 8601形式、UTC）"),
});

/** ログ一覧取得時のレスポンススキーマ */
export const logListResponseSchema = z.object({
  logs: z.array(logEntrySchema).describe("ログエントリの配列（降順）"),
});

/** ログ作成時のレスポンススキーマ */
export const logCreateResponseSchema = logEntrySchema;

/** ログ作成時の入力型 */
export type CreateLogInput = z.infer<typeof createLogSchema>;

/** ログ一覧取得時の入力型 */
export type ListLogsInput = z.infer<typeof listLogsSchema>;
