<!-- BEGIN:common-agent-rules -->
- KISS, DRY, YAGNI を守る
- コロケーションを重視すること
- docs/以下にドキュメントがあるので必要なときに参照すること。ファイル名で判断すること。追加するときはファイル名をわかりやすくつけること。
- ADRを書くこと（docs/adr以下に）。設計上の重要な判断をしたときは必ず書くこと。書くべきか迷う場合はユーザーに確認すること。append-onlyで、過去の内容は変更しないこと。
- フロントエンドはテストコードを書かないでください。
- バックエンドはテストコードを書いてください。
- コードを実装した後は、必ず`verify`スキルを使用してコードが正しく動作し、必要な基準を満たしていることを確認してください。
- スクリプトを実行する際は`&&`は使用せず、1つずつ実行してください。
- 定数は`src/constants/`以下に定義してください。
- 共通の処理は、`src/shared/`以下に定義してください.

## 許可スクリプト
スクリプトはpackage.jsonに書かれているものだけ使用してください。これにより、プロジェクトの一貫性が保たれ、予期しない問題を防ぐことができます。
- `pnpm dev`: 開発サーバーを起動します。
- `pnpm build`: プロジェクトをビルドします。
- `pnpm start`: ビルドされたプロジェクトを起動します。
- `pnpm check`: コードの品質を確認します。(Biome)
- `pnpm format`: コードをフォーマットします。(Biome)
- `pnpm typecheck`: 型チェックを実行します。
- `pnpm test:run`: テストを実行します。(vitest)
- `pnpm build-storybook`: Storybookをビルドします。
- `pnpm db:generate`: Drizzle ORMのコードを生成します。
- `pnpm db:migrate`: データベースのマイグレーションを実行します。
- `pnpm db:push`: データベースのマイグレーションを適用します。
- `pnpm db:reset`: データベースをリセットします。
- `pnpm verify:frontend`: フロントエンドコードの変更に対して、型チェックとコード品質の確認を実行します。
- `pnpm verify`: アプリケーションコードの変更に対して、型チェック、テストの実行、コード品質の確認を実行します。
<!-- END:common-agent-rules -->

<!-- BEGIN:design-agent-rules -->
- 絵文字は使用しないこと
- デザイントークンを定義すること、Tailwind デフォルトカラーは使わない、既存トークンとのトンマナを考えて自前で色を作る、oklchを使うこと
- UIは視線の流れを意識すること
<!-- END:design-agent-rules -->

<!-- BEGIN:typescript-agent-rules -->
- any型を使用しないこと
- unknown型を使用して、必要に応じて型ガードを実装すること
- TSDoc を書くこと（ts, tsxともに必須。@param, @returnsなど）
- すべての .ts / .tsx ファイルの冒頭に、そのファイルの役割・責務を2行程度で記述する、
<!-- END:typescript-agent-rules -->
- 各ページのエントリファイル(page.tsx)には、ロジックを直接書かず。`src/hooks/`以下にカスタムフックを作製すること。
- 共通のUIコンポーネントは、`src/shared/components/`以下に作成すること。
<!-- BEGIN:react-agent-rules -->
- 
<!-- END:react-agent-rules -->
<!-- BEGIN:nextjs-agent-rules -->
 
# Next.js: ALWAYS read docs before coding
 
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
 
- APIは、Controller,Service.Repository,Modelの4層を意識して書くこと。
<!-- END:nextjs-agent-rules -->
