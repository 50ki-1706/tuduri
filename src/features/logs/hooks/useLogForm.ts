/**
 * ログ投稿フォームの状態管理と送信処理を担当するカスタムフック
 * クライアントサイドでの zod バリデーション + oRPC によるサーバー送信を行う
 */
"use client";

import { useCallback, useState } from "react";
import { orpc } from "@/lib/orpc/client";
import type { CreateLogInput } from "@/shared/schemas/log.schema";
import { createLogSchema } from "@/shared/schemas/log.schema";

/** ログフォームの状態 */
interface LogFormState {
  /** 入力中のメッセージ */
  message: string;
  /** 送信中フラグ */
  isSubmitting: boolean;
  /** クライアント側バリデーションエラー（フィールド単位） */
  fieldError: string | null;
  /** サーバー側エラー */
  error: string | null;
  /** 送信成功時のメッセージ */
  lastResult: string | null;
}

/**
 * ログフォームの状態管理と送信処理を提供するフック
 * @returns フォーム状態と操作用関数
 */
export function useLogForm() {
  const [state, setState] = useState<LogFormState>({
    message: "",
    isSubmitting: false,
    fieldError: null,
    error: null,
    lastResult: null,
  });

  /** メッセージ入力の更新 */
  const setMessage = useCallback((message: string) => {
    setState((prev) => ({ ...prev, message, fieldError: null }));
  }, []);

  /**
   * ログを送信する
   * クライアント側で zod バリデーションを実行後、サーバーに送信
   */
  const handleSubmit = useCallback(async () => {
    // クライアント側 zod バリデーション
    const parsed = createLogSchema.safeParse({ message: state.message });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setState((prev) => ({
        ...prev,
        fieldError: firstIssue?.message ?? "入力内容を確認してください",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
      fieldError: null,
    }));

    try {
      await orpc.log.create(parsed.data as CreateLogInput);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        message: "",
        lastResult: "記録しました",
      }));

      // 3秒後に成功表示を消す
      setTimeout(() => {
        setState((prev) => ({ ...prev, lastResult: null }));
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "送信に失敗しました";
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: message,
      }));
    }
  }, [state.message]);

  return {
    message: state.message,
    isSubmitting: state.isSubmitting,
    fieldError: state.fieldError,
    error: state.error,
    lastResult: state.lastResult,
    setMessage,
    handleSubmit,
  };
}
