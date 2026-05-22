import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { router } from "@/lib/orpc/router";

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export async function GET() {
  const spec = await generator.generate(router, {
    info: {
      title: "tuduri API",
      version: "1.0.0",
      description:
        "tuduri ログ管理 API。日々のログを作成・取得するための REST API です。\n\n" +
        "## 認証\n\n" +
        "保護されたエンドポイントは `better-auth.session_token` Cookie によるセッション認証を要求します。\n\n" +
        "### 認証フロー（CLI / 外部ツール向け）\n" +
        "1. Google OAuth 2.0 Authorization Code Flow + PKCE で Google アカウント認証を実行\n" +
        "2. Better Auth が認証コールバックを処理し、セッション Cookie を発行\n" +
        "3. 後続の API 呼び出しでは `Cookie: better-auth.session_token=<token>` ヘッダーを付与\n\n" +
        "CLI 用の詳細な認証手順は別途提供される tuduri-cli ドキュメントを参照してください。",
      contact: { name: "tuduri" },
    },
    servers: [
      { url: "/api/rest", description: "Production" },
      {
        url: "http://localhost:3000/api/rest",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Better Auth セッション Cookie。Google OAuth 2.0 PKCE 認証完了後に発行されます。",
        },
      },
    },
  });

  return Response.json(spec);
}
