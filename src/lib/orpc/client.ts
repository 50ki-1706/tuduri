/**
 * ORPCクライアント — フロントエンドからバックエンドRPCを呼び出すためのクライアント設定
 * 実行環境に応じて絶対URLを解決し、RPCLinkに渡す
 */
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "./router";

/**
 * 実行環境に応じたベースURLを解決する
 * @returns ブラウザ環境では window.location.origin、サーバー環境では環境変数または fallback の絶対URL
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Intent: NEXT_PUBLIC_APP_URL はビルド時にインライン化され、SSR でも参照可能
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

const link = new RPCLink({
  url: `${getBaseUrl()}/api/orpc`,
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link);
