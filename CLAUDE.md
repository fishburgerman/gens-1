# CLAUDE.md — gens 開発ガイド

## プロジェクトの目的
**gens — You’re not alone.** 世界中の同じ出生年（Class）の人々が、互いの存在を感じられる SNS。
いちばんの価値は「1人じゃない安心感」。サーバーなしのデモで、データは localStorage に保存する。UI は日本語・韓国語・英語に対応。
仕様は PRODUCT.md、デザインは DESIGN.md を参照。

## 基本思想（すべての変更で守る）: Belonging First, Discovery Second
- **Home は自分の Class**。アプリを開いて最初に見えるのは必ず自分の Class。Generation は 2 番目の補助的な場所、Explore は発見の場所
- **自分の Class のフィードに他 Class の投稿を混ぜない**（`feedPosts` の条件を緩めない。過疎対策でも混ぜない）
- **架空の数字を実績として表示しない**（利用者数・オンライン人数など。表示してよいのは実際に表示中の投稿から数えた値だけ）
- 人気・ランキング・フォロワー数を作らない。フィードは時系列
- 国・地域は **任意・国単位のみ**（`config/regions.ts` の ISO コード）。詳細な位置情報を集めない
- Weekly Question は **任意**。強制・催促・連続記録を作らない
- 他 Class・他世代は閲覧のみ。投稿・リアクション・回答は自分の Class（と自分の世代フィード）だけ

## 技術構成
- React 19 + TypeScript（strict）+ Vite
- Tailwind CSS v4（`@tailwindcss/vite`、トークンは `src/index.css` の `@theme`）
- React Router（`HashRouter`）
- i18next + react-i18next（多言語対応）
- Vitest（ユニットテスト）
- GitHub Actions → GitHub Pages
- 導入しない: Next.js / Vercel / Supabase / Firebase / 外部 DB / 本格認証 / 有料 API

## ディレクトリ構成
```
src/
  config/generations.ts   世代区分（設定データ）と Class 年の算出
  config/regions.ts       任意の国・地域コード（ISO 3166-1）
  config/weeklyQuestions.ts 今週のお題の ID と週ごとのローテーション
  types.ts                Profile / Post / PostScope / AppData
  lib/rules.ts            投稿・リアクション・お題・地域・プロフィールのルール、フィード抽出（純粋関数）
  lib/storage.ts          バージョン付き localStorage 読み書き・マイグレーション
  lib/time.ts, id.ts      相対時刻の計算（言語非依存）、ID 生成
  i18n/index.ts           i18next 初期化、changeLanguage()
  i18n/languages.ts       対応言語、ブラウザ言語の判定、言語設定の保存
  i18n/useFormat.ts       Class 名・世代名・時刻・エラーの翻訳ヘルパー
  i18n/i18next.d.ts       翻訳キーの型（en.json が基準）
  locales/{en,ja,ko}.json 翻訳ファイル
  data/seed.ts            デモ投稿（架空・isDemo）
  state/store.tsx         アプリ状態（Context）。ルールは lib/rules を通す
  components/             UI 部品（Layout, PostCard, Feed, Composer, WeeklyQuestionCard, DiscoverCard, RegionSelect, Sheet, Icons, Sketch …）
  pages/                  画面（Welcome, Home=My Class, Generation, Explore, ClassView, Profile, Settings）
.github/workflows/deploy.yml
```

## コーディング規約
- 変更前に既存コードを読む。必要以上に複雑にしない（状態管理ライブラリ等は追加しない）
- ドメインロジックは `lib/` の純粋関数に置き、コンポーネントから直接ルールを書かない
- 投稿先と所属 Class の制約は **必ず `lib/rules.ts` で検証**（UI の無効化は補助）。違反は `RuleError(code)` を投げ、UI は `errorMessage()` で `errors.<code>` を翻訳して表示する
- `any` を使わない。型は `src/types.ts` に集約
- 保存データの形を変えるときは `DATA_VERSION` を上げ、`migrations` に変換を追加し、テストを書く（現行 v2。ユーザーの投稿・プロフィールを失わないこと）
- サンプル投稿の ID（`demo_post_<n>`）は変更しない。追加は末尾のみ（移行時のリアクション引き継ぎに使う）
- 世代区分の変更は `config/generations.ts` のみで行う
- UI テキストは必ず翻訳キー経由（下記「多言語対応」）。コメント・ドキュメントは日本語/英語どちらでも可
- 空状態・エラー状態を必ず用意する

## 多言語対応（i18n）
- 文言を追加するときは **`en.json` → `ja.json` → `ko.json` の 3 ファイルすべて** に同じキーで追加する
- コンポーネントでは `useTranslation()` の `t()`、または `useFormat()`（Class 名・世代名・時刻・エラー）を使う。JSX に英語を直書きしない
- キーは `画面.用途`（例: `composer.review`）。共通語は `common.*`、エラーは `errors.*`
- 複数形: 英語は `_one` / `_other`、日本語・韓国語は `_other` のみ。呼び出しは `t('explore.posts', { count })`
- 文中に太字等が入る場合は `<Trans>` と `<strong>` タグを使い、語順を各言語に任せる（文字列連結で文を組み立てない）
- 世代名・タグラインは `generations.<GenerationId>.*`、お題は `weekly.questions.<id>`。追加したら 3 言語に追加
- 国・地域名は翻訳キーを作らず `useFormat().regionName()`（`Intl.DisplayNames`）を使う
- 投稿本文・自己紹介・表示名は翻訳しない。`dir="auto"` と `.post-body` クラスを付ける
- 日付は `useFormat().relativeTime / fullTime`（`Intl` に現在の言語を渡す）
- 翻訳漏れの防止:
  - 型: `en.json` にないキーを `t()` に渡すと `tsc` がエラーにする
  - テスト（`src/i18n/locales.test.ts`）: 3 言語のキー一致・空文字なし・プレースホルダー一致・`_other` の存在・JSX 内の英語直書き検出
- CJK の書体と行間は `src/index.css` の `:lang(ja)` / `:lang(ko)` で調整（韓国語は `word-break: keep-all`）。`<html lang>` は言語切り替え時に自動更新

## UI デザイン原則（要約）
- パレット・フォントは DESIGN.md のトークンを使う（任意の色を直書きしない）
- 手描き要素は控えめに。絵文字をアイコン代わりにしない。グラデーション・発光カードを使わない
- モバイルファースト（iPhone Safari）。Safe Area、44px 以上のタップ領域、入力 16px 以上
- 下部タブナビゲーション、シートは下から

## テスト方針
- `npm test`: ルール（投稿権限・本文検証・リアクション・フィード分離・他 Class を混ぜないこと）、お題（週の切り替え・回答先・期限）、地域、Explore の抽出、ストレージ（往復・破損データ・v1→v2 移行）、世代設定、言語判定、相対時刻、翻訳ファイルの整合性
- `npm run build`: 型チェック + 本番ビルド
- UI を変えたら iPhone サイズ（390×844）で主要フローを **3 言語それぞれ** 確認: 登録（地域任意）→ Home が自分の Class → 投稿 → お題に回答 → Generation 投稿 → Explore（検索・他世代・地域フィルタ）で他 Class が閲覧専用 → 再読み込みで保持 → 言語切り替え → Reset。日本語・韓国語は文字列が長くなりやすいので横はみ出しに注意
- 変更後は必ずテストとビルドを通してからコミット

## GitHub Pages の公開方法
- `vite.config.ts` の `base` はリポジトリ名 `/gens-1/` に合わせる（リポジトリ名変更時は要更新）
- `main` への push で `.github/workflows/deploy.yml` がテスト → ビルド → Pages へデプロイ
- 初回のみ Settings → Pages → Source を「GitHub Actions」に設定
- ルーティングは `HashRouter`（`/#/explore/2001` 形式）なので、リロードや直リンクで 404 にならない。念のため `404.html` も `index.html` のコピーとして出力
- 公開 URL: https://fishburgerman.github.io/gens-1/

## 変更時の注意事項
- 所属 Class（birthYear）をプロフィール編集で変更可能にしない
- Home を Generation や Explore に置き換えない。下部ナビの順番は Home / Generation / Explore / Profile
- デモ投稿は `isDemo: true` と「Sample」表示を維持し、実在ユーザーと誤認させない
- localStorage は端末内保存であり共有されないことを UI/ドキュメントで偽らない
- 実装しない機能（DM・通知・画像・フォロー・タイムカプセル・収益化・AI 推薦）は PRODUCT.md の将来候補に記録するのみ
- 作業ブランチで開発し、ビルドとテストが通った状態でコミット・プッシュする
