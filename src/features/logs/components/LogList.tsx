/**
 * ログ一覧表示の純粋UIコンポーネント
 * データ取得ロジックは持たず、props で状態とコールバックを受け取る
 */
"use client";

/**
 * ログエントリの型
 */
interface LogEntry {
  id: string;
  author: string;
  message: string;
  parent: string | null;
  createdAt: string;
}

/**
 * LogList コンポーネントの props
 */
interface LogListProps {
  /** 表示するログの配列 */
  logs: LogEntry[];
  /** ログ取得中 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 現在の日付フィルタ値（YYYY-MM-DD 形式または空文字） */
  dateFilter: string;
  /** 日付フィルタ変更時のコールバック */
  onDateFilterChange: (date: string) => void;
  /** 日付フィルタクリア時のコールバック */
  onClearFilter: () => void;
}

/**
 * 日付文字列を日本語表記にフォーマットする
 * @param isoString - ISO 8601 形式の日付文字列
 * @returns フォーマット済み日付文字列
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * ログ一覧を表示するコンポーネント
 * ローディング、エラー、空、データありの4状態をハンドリングする
 */
export default function LogList({
  logs,
  isLoading,
  error,
  dateFilter,
  onDateFilterChange,
  onClearFilter,
}: LogListProps) {
  return (
    <section className="flex flex-col gap-4">
      {/* 日付フィルタ */}
      <div className="flex items-end gap-2">
        <label className="form-control w-full max-w-xs">
          <span className="label-text text-sm text-base-content/60">
            日付で絞り込み（UTC）
          </span>
          <input
            type="date"
            className="input input-bordered"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
          />
        </label>
        {dateFilter && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClearFilter}
          >
            絞り込みを解除
          </button>
        )}
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-12"
          aria-busy="true"
        >
          <span className="loading loading-spinner loading-lg" />
          <span className="ml-3 text-base-content/60">読み込み中...</span>
        </div>
      )}

      {/* エラー状態 */}
      {!isLoading && error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* 空状態 */}
      {!isLoading && !error && logs.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-base-content/40">
          <p className="text-lg">まだ記録がありません</p>
          <p className="text-sm">
            {dateFilter
              ? "指定された日付の記録はありません"
              : "ホーム画面から最初の記録を書きましょう"}
          </p>
        </div>
      )}

      {/* ログ一覧 */}
      {!isLoading &&
        !error &&
        logs.length > 0 &&
        logs.map((log) => (
          <article key={log.id} className="card card-bordered bg-base-200">
            <div className="card-body gap-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{log.author}</span>
                <time className="text-xs text-base-content/40">
                  {formatDate(log.createdAt)}
                </time>
              </div>
              <p className="text-base-content/80 whitespace-pre-wrap break-words">
                {log.message}
              </p>
            </div>
          </article>
        ))}
    </section>
  );
}
