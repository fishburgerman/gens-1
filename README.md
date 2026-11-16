# gens

**gens — You’re not alone.** 同じ年に生まれた仲間が、世界中にいる。

世界中の同じ出生年（Class）の人々が、互いの存在を感じられる SNS のプロトタイプ（v0.3）です。基本思想は **Belonging First, Discovery Second**：最初に見えるのは必ず自分の Class、ほかの年や国の日常は Explore で発見します。

- 公開URL（GitHub Pages）: https://fishburgerman.github.io/gens-1/
- UI言語: 日本語 / 한국어 / English（ブラウザの言語設定から自動判定、設定画面で切り替え可能）
- データ保存: ブラウザの localStorage（端末内のデモ保存。ユーザー間で共有されません）

## できること

| 画面 | 内容 |
| --- | --- |
| Welcome | 言語、表示名、出生年、国・地域（任意）を入力して開始 |
| Home（My Class） | 自分の Class。同い年が世界中にいることを感じるヘッダー、今週のお題、Class フィード、Explore への導線 |
| Generation | 世代（Gen Z）共通フィード。補助的な交流の場 |
| Explore | 出生年検索、世代別 Class 一覧（他世代を含む）、世界の日常フィード（国・地域で絞り込み）。すべて閲覧専用 |
| Create Post | 投稿先（自分の Class / Generation）、書き出しのヒント、確認 → 投稿。今週のお題への回答 |
| Profile | 表示名・出生年・Generation・Class・国・地域・自己紹介・自分の投稿・編集 |
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
