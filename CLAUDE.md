# CLAUDE.md — gens 開発ガイド

## プロジェクトの目的
世代別 SNS「gens」の MVP。Generation（世代）と Class（出生年）を軸に、落ち着いた空間で同世代とつながる Web アプリ。
v0.1 はサーバーなしのデモで、データは localStorage に保存する。仕様は PRODUCT.md、デザインは DESIGN.md を参照。

## 技術構成
- React 19 + TypeScript（strict）+ Vite
- Tailwind CSS v4（`@tailwindcss/vite`、トークンは `src/index.css` の `@theme`）
- React Router（`HashRouter`）
- Vitest（ユニットテスト）
- GitHub Actions → GitHub Pages
- 導入しない: Next.js / Vercel / Supabase / Firebase / 外部 DB / 本格認証 / 有料 API

## ディレクトリ構成
```
src/
  config/generations.ts   世代区分（設定データ）と Class 年の算出
  types.ts                Profile / Post / PostScope / AppData
  lib/rules.ts            投稿・リアクション・プロフィールのルールと検証（純粋関数）
  lib/storage.ts          バージョン付き localStorage 読み書き・マイグレーション
  lib/time.ts, id.ts      表示用時刻、ID 生成
  data/seed.ts            デモ投稿（架空・isDemo）
  state/store.tsx         アプリ状態（Context）。ルールは lib/rules を通す
  components/             UI 部品（Layout, PostCard, Feed, Composer, Sheet, Icons, Sketch …）
  pages/                  画面（Welcome, Home, MyClass, Explore, ClassView, Profile）
.github/workflows/deploy.yml
```

## コーディング規約
- 変更前に既存コードを読む。必要以上に複雑にしない（状態管理ライブラリ等は追加しない）
- ドメインロジックは `lib/` の純粋関数に置き、コンポーネントから直接ルールを書かない
- 投稿先と所属 Class の制約は **必ず `lib/rules.ts` で検証**（UI の無効化は補助）。違反は `RuleError` を投げ、UI はメッセージを表示する
- `any` を使わない。型は `src/types.ts` に集約
- 保存データの形を変えるときは `DATA_VERSION` を上げ、`migrations` に変換を追加し、テストを書く
- 世代区分の変更は `config/generations.ts` のみで行う
- UI テキストは英語。コメント・ドキュメントは日本語/英語どちらでも可
- 空状態・エラー状態を必ず用意する

## UI デザイン原則（要約）
- パレット・フォントは DESIGN.md のトークンを使う（任意の色を直書きしない）
- 手描き要素は控えめに。絵文字をアイコン代わりにしない。グラデーション・発光カードを使わない
- モバイルファースト（iPhone Safari）。Safe Area、44px 以上のタップ領域、入力 16px 以上
- 下部タブナビゲーション、シートは下から

## テスト方針
- `npm test`: ルール（投稿権限・本文検証・リアクション・フィード分離）、ストレージ（往復・破損データ・バージョン）、世代設定
- `npm run build`: 型チェック + 本番ビルド
- UI を変えたら iPhone サイズ（390×844）で主要フローを確認: 登録 → Home 投稿 → My Class 投稿 → Explore で他 Class が閲覧専用 → 再読み込みで保持 → Reset
- 変更後は必ずテストとビルドを通してからコミット

## GitHub Pages の公開方法
- `vite.config.ts` の `base` はリポジトリ名 `/gens-1/` に合わせる（リポジトリ名変更時は要更新）
- `main` への push で `.github/workflows/deploy.yml` がテスト → ビルド → Pages へデプロイ
- 初回のみ Settings → Pages → Source を「GitHub Actions」に設定
- ルーティングは `HashRouter`（`/#/explore/2001` 形式）なので、リロードや直リンクで 404 にならない。念のため `404.html` も `index.html` のコピーとして出力
- 公開 URL: https://fishburgerman.github.io/gens-1/

## 変更時の注意事項
- 所属 Class（birthYear）をプロフィール編集で変更可能にしない
- デモ投稿は `isDemo: true` と「Sample」表示を維持し、実在ユーザーと誤認させない
- localStorage は端末内保存であり共有されないことを UI/ドキュメントで偽らない
- 実装しない機能（DM・通知・画像・フォロー・タイムカプセル・収益化・AI 推薦）は PRODUCT.md の将来候補に記録するのみ
- 作業ブランチで開発し、ビルドとテストが通った状態でコミット・プッシュする
