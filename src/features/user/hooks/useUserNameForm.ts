/**
 * ユーザー名編集の状態管理と送信処理を担当するカスタムフック
 * クライアントサイドでの zod バリデーション + oRPC によるサーバー送信を行う
 * 更新後は Better Auth のセッションを再取得して表示を更新する
 */
"use client";

import { useCallback, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc/client";
import { updateNameSchema } from "@/shared/schemas/user.schema";

/** ユーザー名編集フォームの状態 */
interface UserNameFormState {
  /** 編集中フラグ */
  isEditing: boolean;
  /** 編集中の名前（入力値） */
  name: string;
  /** 送信中フラグ */
  isSubmitting: boolean;
  /** クライアント側バリデーションエラー */
  fieldError: string | null;
  /** サーバー側エラー */
  error: string | null;
}

/**
 * ユーザー名編集機能を提供するフック
 * @returns フォーム状態と操作用関数
 */
export function useUserNameForm() {
  const { data: session, refetch } = useSession();
  const [state, setState] = useState<UserNameFormState>({
    isEditing: false,
    name: "",
    isSubmitting: false,
    fieldError: null,
    error: null,
  });

  /** 編集モードを開始する */
  const startEdit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditing: true,
      name: session?.user.name ?? "",
      fieldError: null,
      error: null,
    }));
  }, [session?.user.name]);

  /** 編集をキャンセルする */
  const cancelEdit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      name: "",
      fieldError: null,
      error: null,
    }));
  }, []);

  /** 編集中の名前を更新する */
  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name, fieldError: null }));
  }, []);

  /**
   * ユーザー名を送信する
   * クライアント側で zod バリデーションを実行後、サーバーに送信
   */
  const handleSubmit = useCallback(async () => {
    // クライアント側 zod バリデーション
    const parsed = updateNameSchema.safeParse({ name: state.name });
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
      await orpc.user.updateName({ name: parsed.data.name });
      // セッションを再取得して表示を更新
      await refetch();
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        isEditing: false,
        name: "",
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新に失敗しました";
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: message,
      }));
    }
  }, [state.name, refetch]);

  /** 現在のユーザー名 */
  const currentName = session?.user.name ?? "";

  return {
    currentName,
    isEditing: state.isEditing,
    name: state.name,
    isSubmitting: state.isSubmitting,
    fieldError: state.fieldError,
    error: state.error,
    startEdit,
    cancelEdit,
    setName,
    handleSubmit,
  };
}
