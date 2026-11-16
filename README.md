# gens

世代別SNS「gens」のプロトタイプ（v0.2）。同じ世代・同じ出生年（Class）の人たちが落ち着いてつながるための、モバイルファーストな Web アプリです。

- 公開URL（GitHub Pages）: https://fishburgerman.github.io/gens-1/
- UI言語: 日本語 / 한국어 / English（ブラウザの言語設定から自動判定、設定画面で切り替え可能）
- データ保存: ブラウザの localStorage（端末内のデモ保存。ユーザー間で共有されません）

## できること

| 画面 | 内容 |
| --- | --- |
| Welcome | 言語選択、表示名・出生年を入力し、Generation / Class を確認して開始 |
| Home | Generation（Gen Z）共通フィード、投稿、リアクション |
| My Class | 自分の出生年の Class フィード、投稿、リアクション |
| Explore | Gen Z の各 Class 一覧と、他 Class の閲覧専用フィード |
| Create Post | 投稿先（自分の Class / Generation）の選択 → 確認 → 投稿 |
| Profile | 表示名・出生年・Generation・Class・自己紹介・自分の投稿・編集 |
| Settings | 言語の切り替え（即時反映・端末に保存）、デモリセット |

## 開発

```bash
npm install
npm run dev       # http://localhost:5173/gens-1/
npm test          # Vitest（ルール・保存・設定のユニットテスト）
npm run build     # 型チェック + 本番ビルド（dist/）
npm run preview   # 本番ビルドの確認
```

Node.js 22 以上を推奨。

## 多言語対応

- 対応言語: 日本語（ja）・韓国語（ko）・英語（en）
- 実装: i18next + react-i18next。翻訳ファイルは `src/locales/{en,ja,ko}.json`
- 初期言語はブラウザの言語設定（`navigator.languages`）から判定し、非対応言語なら英語
- 選んだ言語は localStorage の `gens:language` に保存
- 切り替えは再読み込みなしで即時反映。投稿本文・自己紹介・表示名は翻訳しない
- 翻訳の追加・変更方法は [CLAUDE.md](./CLAUDE.md#多言語対応i18n) を参照

## デプロイ

`main` ブランチへの push で GitHub Actions（`.github/workflows/deploy.yml`）がテスト・ビルドし、GitHub Pages に公開します。他のブランチではテストとビルドのみ実行します。

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## ドキュメント

- [PRODUCT.md](./PRODUCT.md) — プロダクト仕様・コミュニティ構造・将来の拡張候補
- [DESIGN.md](./DESIGN.md) — デザインコンセプト「California Sketch」
- [CLAUDE.md](./CLAUDE.md) — 開発ガイド（構成・規約・テスト・公開方法）
