/**
 * ログ入力フォームのUIコンポーネント
 * daisyUI の textarea + button で構成されるシンプルなフォーム
 * 文字数カウンターと送信後のフィードバック表示を含む
 */
"use client";

import { LOG_MESSAGE_MAX_LENGTH } from "@/constants/log";

/** LogForm コンポーネントの Props */
interface LogFormProps {
  /** 入力中のメッセージ */
  message: string;
  /** 送信中フラグ */
  isSubmitting: boolean;
  /** フィールド単位のバリデーションエラー */
  fieldError: string | null;
  /** サーバー側エラー */
  error: string | null;
  /** 送信成功時のメッセージ */
  lastResult: string | null;
  /** メッセージ変更時のコールバック */
  onMessageChange: (message: string) => void;
  /** 送信時のコールバック */
  onSubmit: () => void;
}

/**
 * ログ入力フォームコンポーネント
 * テキストエリアと送信ボタンを提供する
 */
export default function LogForm({
  message,
  isSubmitting,
  fieldError,
  error,
  lastResult,
  onMessageChange,
  onSubmit,
}: LogFormProps) {
  const charCount = message.length;
  const isOverLimit = charCount > LOG_MESSAGE_MAX_LENGTH;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 成功フィードバック */}
      {lastResult && (
        <div className="alert alert-success">
          <span>{lastResult}</span>
        </div>
      )}

      {/* サーバーエラー */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* テキストエリア */}
      <div className="flex flex-col gap-1">
        <textarea
          className={`textarea textarea-bordered w-full h-40 ${
            fieldError ? "textarea-error" : ""
          }`}
          placeholder="いま感じていることを書いてみましょう"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          disabled={isSubmitting}
          maxLength={LOG_MESSAGE_MAX_LENGTH + 100}
        />
        <div className="flex justify-between items-center text-sm">
          {fieldError ? (
            <span className="text-error">{fieldError}</span>
          ) : (
            <span />
          )}
          <span
            className={`${isOverLimit ? "text-error" : "text-base-content/50"}`}
          >
            {charCount} / {LOG_MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSubmit}
        disabled={isSubmitting || isOverLimit || message.trim().length === 0}
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            記録中...
          </>
        ) : (
          "記録する"
        )}
      </button>
    </div>
  );
}
