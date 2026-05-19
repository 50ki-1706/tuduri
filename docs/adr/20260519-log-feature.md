# ADR: ログ記録機能の設計

- **Status**: Accepted
- **Date**: 2026-05-19

## コンテキスト

日々の思いや感情をその場で書き留め、後から AI 分析に活用するためのシンプルなログ記録アプリケーションが必要。
テキスト入力と送信ボタンのみの最小限の UI で、git log のようなイミュータブルなチェーン構造を持つログを記録する。

## 決定

### データモデル

`log` テーブルを以下の構造で定義する：

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text (UUID v4) | 主キー。git のコミットハッシュに相当 |
| userId | text (FK → user.id) | ログ所有者。CASCADE 削除 |
| author | text | 作成時点の user.name のスナップショット |
| message | text | 本文（1〜500文字） |
| parent | text (FK → log.id, nullable) | 直前ログの ID。初回は null |
| createdAt | timestamp | 作成日時（UTC） |

- **イミュータブル**: 作成後の更新・削除は不可。`updatedAt` カラムなし
- **git-log 風チェーン**: `parent` が自己参照 FK で直前ログを指す
- **著者名スナップショット**: ログ作成時の `user.name` をコピー。後からユーザー名を変更してもログの著者名は変わらない。`name` が null/空の場合は `"Unknown"` をフォールバックとして使用

### 並行書き込みのチェーン分岐

同一ユーザーが複数タブから同時にログを送信した場合、両方のログが同じ `parent` を持つ可能性がある（チェーンの分岐）。
本アプリはパーソナルユースであり、同一ユーザーの同時書き込みは実質的に発生しないため、**分岐を許容する**。
将来的に厳密な直列化が必要になった場合は、楽観的ロックまたはトランザクションを導入する。

### UI フレームワーク: daisyUI

daisyUI を採用し、以下の方針でテーマを定義する：

- **カスタムテーマのみ使用**: daisyUI のビルトインテーマ（`light`, `dark` 等）は一切使用しない
- **oklch カラースペース**: 全カラー変数を oklch で定義し、Tailwind デフォルトカラーに依存しない
- **2テーマ**: `tuduri-light`（デフォルト）と `tuduri-dark` を提供
- **テーマ切り替え**: `localStorage` に永続化し、`data-theme` 属性で切り替え。フラッシュ防止のため `<head>` 内のインラインスクリプトで初期化

### API 設計

4層アーキテクチャ（Controller → Service → Repository → Model）で実装：

| 層 | ファイル | 責務 |
|----|---------|------|
| Controller | `router.ts` | oRPC プロシージャ定義、入力バリデーション、認証 |
| Service | `services/*.ts` | ビジネスロジック（UUID 生成、parent 解決、スナップショット） |
| Repository | `repositories/*.ts` | Drizzle ORM による DB アクセス |
| Model | `db/schema.ts` | テーブル定義 |

プロシージャ：
- `log.create`: 認証必須。message からログを作成
- `log.list`: 認証必須。自分のログのみ取得。`date` パラメータで日付フィルタ可能
- `user.updateName`: 認証必須。自分の名前を更新

### 日付・タイムゾーン

- `createdAt` は UTC で保存
- `log.list` の `date` パラメータ（`YYYY-MM-DD`）も UTC として解釈
- フィルタ範囲: `createdAt >= {date}T00:00:00.000Z AND createdAt < {date+1}T00:00:00.000Z`

### バリデーション

zod スキーマを `src/shared/schemas/` に定義し、クライアント・サーバー両方で共有：

- `createLogSchema`: message を `.trim().min(1).max(500)` で検証
- `listLogsSchema`: date を `.date()` で実在日付チェック
- `updateNameSchema`: name を `.trim().min(1).max(100)` で検証

### DB マイグレーション

- 開発環境では `pnpm db:push` による直接適用を許容
- 本番環境では `pnpm db:generate` → `pnpm db:migrate` による通常フローを使用
- 旧サンプルテーブル（`posts`, `counters`）は削除

## 結果

シンプルで拡張性のあるログ記録基盤が構築された。今後の AI 分析連携に備え、外部 API（`log.list`）を通じて特定日付のログを取得可能。
