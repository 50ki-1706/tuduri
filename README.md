# tuduri

日々の思いや感情をその場で書き留め、あとから AI 分析に活用するためのシンプルなログ記録アプリです。

テキスト入力と送信ボタンだけの最小限の UI で、git log のようなイミュータブルなチェーン構造を持つログを積み重ねていきます。

## 特徴

- **シンプルな UI**: テキストエリアと送信ボタンのみ。思考の邪魔をしません
- **Google ログイン**: Google アカウントで簡単にログイン
- **イミュータブルなログ**: 一度記録したログは変更不可。git のコミット履歴のようなチェーン構造
- **ダーク / ライトテーマ**: カスタムデザイントークンによる目に優しい配色
- **外部 API**: 記録したログを日付指定で取得可能。AI 分析との連携を想定

## 技術スタック

- [Next.js 16](https://nextjs.org/) — React フレームワーク
- [Better Auth](https://better-auth.com) — Google OAuth 認証
- [Drizzle ORM](https://orm.drizzle.team/) + SQLite — データベース
- [oRPC](https://orpc.dev) — 型安全な API レイヤー
- [daisyUI](https://daisyui.com/) + Tailwind CSS v4 — UI コンポーネント
- [Biome](https://biomejs.dev/) — コードフォーマット / リント
- [Vitest](https://vitest.dev/) — テスト

## セットアップ

### 前提条件

- Node.js 22+
- pnpm 11+

### 1. インストール

```bash
pnpm install
```

### 2. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` に以下を設定してください:

| 変数 | 必須 | 説明 |
|------|------|------|
| `GOOGLE_CLIENT_ID` | はい | Google OAuth クライアント ID |
| `GOOGLE_CLIENT_SECRET` | はい | Google OAuth クライアントシークレット |
| `BETTER_AUTH_SECRET` | はい | 32バイトのランダム hex 文字列（`openssl rand -hex 32` で生成） |
| `BETTER_AUTH_URL` | いいえ | アプリのベースURL。デフォルト: `http://localhost:3000` |
| `DATABASE_URL` | いいえ | DB 接続文字列。デフォルト: `file:local.db` |

### 3. データベースセットアップ

```bash
pnpm db:push
```

### 4. 開発サーバー起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## 利用可能なスクリプト

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | ビルド済みアプリの起動 |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm check` | Biome によるコード品質チェック |
| `pnpm format` | Biome によるコードフォーマット |
| `pnpm test:run` | テスト実行 |
| `pnpm verify` | 型チェック + テスト + コード品質チェック |
| `pnpm db:push` | DB スキーマを直接適用 |
| `pnpm db:generate` | マイグレーションファイル生成 |
| `pnpm db:migrate` | マイグレーション実行 |

## アーキテクチャ

```
Controller (router.ts) → Service (*.service.ts) → Repository (*.repository.ts) → Model (schema.ts)
```

API は Controller / Service / Repository / Model の4層で構成されています。
設計判断の詳細は [docs/adr/](./docs/adr/) を参照してください。
