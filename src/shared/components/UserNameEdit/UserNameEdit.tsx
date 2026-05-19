/**
 * ユーザー名表示・編集のUIコンポーネント
 * 通常時は名前を表示し、編集ボタンでインライン編集モードに切り替わる
 */
"use client";

/** UserNameEdit コンポーネントの Props */
interface UserNameEditProps {
  /** 現在のユーザー名 */
  currentName: string;
  /** 編集中フラグ */
  isEditing: boolean;
  /** 編集中の名前 */
  name: string;
  /** 送信中フラグ */
  isSubmitting: boolean;
  /** バリデーションエラー */
  fieldError: string | null;
  /** サーバーエラー */
  error: string | null;
  /** 編集開始時のコールバック */
  onStartEdit: () => void;
  /** キャンセル時のコールバック */
  onCancelEdit: () => void;
  /** 名前変更時のコールバック */
  onNameChange: (name: string) => void;
  /** 保存時のコールバック */
  onSave: () => void;
}

/**
 * ユーザー名表示・編集コンポーネント
 */
export default function UserNameEdit({
  currentName,
  isEditing,
  name,
  isSubmitting,
  fieldError,
  error,
  onStartEdit,
  onCancelEdit,
  onNameChange,
  onSave,
}: UserNameEditProps) {
  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{currentName}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onStartEdit}
        >
          編集
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={`input input-bordered input-sm ${
            fieldError ? "input-error" : ""
          }`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isSubmitting}
          placeholder="新しい名前"
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={isSubmitting || name.trim().length === 0}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "保存"
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onCancelEdit}
          disabled={isSubmitting}
        >
          キャンセル
        </button>
      </div>
      {fieldError && <span className="text-error text-xs">{fieldError}</span>}
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
}
