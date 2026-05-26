/**
 * APIドキュメントページの表示を担当するコンポーネントです。
 * Scalar の OpenAPI 参照画面を描画します。
 */
"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

/**
 * APIドキュメントページを表示します。
 *
 * @returns API ドキュメント画面
 */
export function DocsPage() {
  return (
    <ApiReferenceReact
      configuration={{
        spec: {
          url: "/api/openapi",
        },
      }}
    />
  );
}
