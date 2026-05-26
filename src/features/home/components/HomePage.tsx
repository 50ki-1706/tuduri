/**
 * ホームページの本体コンポーネント
 * 認証状態に応じてログイン導線またはログ入力画面を表示する
 */
"use client";

import Link from "next/link";
import { useLogForm } from "@/features/logs/hooks/useLogForm";
import { useUserNameForm } from "@/features/user/hooks/useUserNameForm";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import LogForm from "@/shared/components/LogForm/LogForm";
import ThemeToggle from "@/shared/components/ThemeToggle/ThemeToggle";
import UserNameEdit from "@/shared/components/UserNameEdit/UserNameEdit";

export function HomePage() {
  const { data: session, isPending } = useSession();
  const logForm = useLogForm();
  const userNameForm = useUserNameForm();

  if (isPending) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  // 未認証時の表示
  if (!session) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold leading-9 tracking-tight">
            tuduri
          </h1>
          <p className="text-base-content/60 leading-7">
            日々の思いをその場で書き留め、
            <br />
            あとから振り返るためのシンプルなログアプリです。
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

  // 認証済み時の表示
  return (
    <main className="flex flex-1 w-full max-w-2xl flex-col gap-6 px-6 py-8 mx-auto items-center justify-center">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <UserNameEdit
          currentName={userNameForm.currentName}
          isEditing={userNameForm.isEditing}
          name={userNameForm.name}
          isSubmitting={userNameForm.isSubmitting}
          fieldError={userNameForm.fieldError}
          error={userNameForm.error}
          onStartEdit={userNameForm.startEdit}
          onCancelEdit={userNameForm.cancelEdit}
          onNameChange={userNameForm.setName}
          onSave={userNameForm.handleSubmit}
        />
        <div className="flex items-center gap-2">
          <Link href="/logs" className="btn btn-ghost btn-sm">
            記録を見る
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => signOut()}
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* ログ入力フォーム */}
      <LogForm
        message={logForm.message}
        isSubmitting={logForm.isSubmitting}
        fieldError={logForm.fieldError}
        error={logForm.error}
        lastResult={logForm.lastResult}
        onMessageChange={logForm.setMessage}
        onSubmit={logForm.handleSubmit}
      />
    </main>
  );
}

export default HomePage;
