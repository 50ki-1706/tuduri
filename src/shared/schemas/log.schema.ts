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
    ),
});

/** ログ一覧取得時のバリデーションスキーマ */
export const listLogsSchema = z.object({
  date: z.string().date("日付形式が正しくありません（YYYY-MM-DD）").optional(),
});

/** ログ作成時の入力型 */
export type CreateLogInput = z.infer<typeof createLogSchema>;

/** ログ一覧取得時の入力型 */
export type ListLogsInput = z.infer<typeof listLogsSchema>;
