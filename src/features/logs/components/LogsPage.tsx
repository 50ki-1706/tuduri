/**
 * ログ一覧ページの表示を担当するコンポーネントです。
 * 認証状態に応じてローディング、ログイン案内、ログ一覧を切り替えます。
 */
"use client";

import Link from "next/link";
import LogList from "@/features/logs/components/LogList";
import { useLogList } from "@/features/logs/hooks/useLogList";
import { signIn, useSession } from "@/lib/auth-client";

export function LogsPage() {
  const { data: session, isPending } = useSession();
  // Intent: 認証確認が完了するまでログ取得を開始しない
  const enabled = !isPending && !!session;
  const { logs, isLoading, error, dateFilter, setDateFilter, clearFilter } =
    useLogList(enabled);

  if (isPending) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold leading-9 tracking-tight">
            ログ一覧
          </h1>
          <p className="text-base-content/60 leading-7">
            記録を表示するにはログインが必要です
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => signIn.social({ provider: "google" })}
        >
          Google でログイン
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 w-full max-w-2xl flex-col gap-6 px-6 py-8 mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">ログ一覧</h1>
        <Link href="/" className="btn btn-ghost btn-sm">
          ホームに戻る
        </Link>
      </div>
      <LogList
        logs={logs}
        isLoading={isLoading}
        error={error}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilter={clearFilter}
      />
    </main>
  );
}

export default LogsPage;
