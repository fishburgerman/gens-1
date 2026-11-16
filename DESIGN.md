# Design — California Sketch

カリフォルニアの穏やかなライフスタイル、海辺の空気感、自然光、手描きのラインアートを組み合わせた SNS デザイン。
長時間使っても疲れにくい、自然体で心地よいインターフェースを目指す。

## カラーパレット

Tailwind のテーマトークンとして `src/index.css` の `@theme` に定義。

| Token | Hex | 用途 |
| --- | --- | --- |
| `paper` | #FAF8F4 | 背景 |
| `surface` | #FFFFFF | カード・入力 |
| `sand` | #EDE5D8 | 補助面、セグメント、注意書き |
| `sand-deep` | #DCD1BF | 区切り線、ハンドル |
| `sage` / `sage-deep` | #A8B8A0 / #6F8467 | Class のアクセント、Thoughtful |
| `ocean` / `ocean-deep` | #86AFC0 / #4F7F93 | フォーカス、リンク、Same |
| `ink` | #303A3B | 本文、主要ボタン |
| `muted` | #7B8582 | 補足テキスト |
| `line` | #E7E1D6 | カード枠線 |
| `clay` | #B9785F | Warm、エラー、破壊的操作 |

## タイポグラフィ

- 本文: Inter（フォールバック: -apple-system / SF Pro）。15–16px、行間ゆったり
- 見出し: Fraunces（温かみのあるセリフ）。ページタイトル、ロゴ、シート見出しのみ
- 入力欄は 16px 以上（iOS Safari の自動ズーム防止）

## 手描き要素

`src/components/Sketch.tsx`

- **Logo**: 「gens」+ 小さな波線
- **Shoreline**: わずかに揺らぐ細い線。ページ見出し下の区切りに使用
- **CoastScene**: ヤシ・太陽・波の線画。Welcome のみ

アイコン（`Icons.tsx`）は 1.6px の細い線、角丸の線端。絵文字は UI アイコンに使わない。

## 原則

- 手描き感は中程度。装飾的アクセントに限定し、本文の可読性を優先
- 余白を広く、角丸は自然に（カード 20px、ボタンは pill）
- グラデーション・発光・派手なアニメーションを使わない。影はごく薄く、浮かせる要素（FAB・トースト・シート）のみ
- 動きは短く控えめ（フェード、シートのスライド）。`prefers-reduced-motion` に対応
- 数字の誇示（フォロワー数・ランキング）をしない

## モバイル / iPhone Safari

- `viewport-fit=cover` と `env(safe-area-inset-*)` で Safe Area に対応
- 画面下部のタブバー（Home / My Class / Explore / Profile）で片手操作
- 投稿ボタン（FAB）はタブバーのすぐ上、右手の親指の位置
- 投稿作成・プロフィール編集はボトムシート。主要アクション（Review / Post）はシート上部に置き、キーボード表示中も押せる
- タップ領域は 44px 以上
- コンテンツ幅は最大 512px（タブレット・PC では中央寄せ）
