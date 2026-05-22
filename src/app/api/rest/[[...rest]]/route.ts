/**
 * REST API エンドポイント — CLI や外部ツール向けの RESTful API を提供する
 * @orpc/openapi の OpenAPIHandler を使用し、router 定義の method/path に基づいてルーティングする
 */
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { createORPCContext } from "@/lib/orpc/context";
import { router } from "@/lib/orpc/router";

const handler = new OpenAPIHandler(router);

/**
 * リクエストを oRPC ルーターに委譲し、マッチするルートがあればレスポンスを返す
 * @param request - 受信した HTTP リクエスト
 * @returns ルートに応じたレスポンス、または 404
 */
async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rest",
    context: await createORPCContext(),
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
