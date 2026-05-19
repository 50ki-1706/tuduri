/**
 * ユーザー操作に関する zod バリデーションスキーマ
 * クライアント・サーバー両方で共有する
 */
import { z } from "zod";

/** ユーザー名更新時のバリデーションスキーマ */
export const updateNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(100, "100文字以内で入力してください"),
});

/** ユーザー名更新時の入力型 */
export type UpdateNameInput = z.infer<typeof updateNameSchema>;
