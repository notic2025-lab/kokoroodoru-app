# 心踊る街 — AR Navigation / Edition 03

[実景合成プレビューを開く](https://notic2025-lab.github.io/kokoroodoru-app/components/#ar-navigation)

## 体験の考え方

「道を知る」と「そこへ行きたくなる」を重ねる。現実の通路を主役に、場所の気配を小さな仮想の目印として置く。目的地の泉、喫煙所の炎、ステージの音の波紋を、同じ世界観の中で展開する。

提供された写真の、実景上の矢印・上部の状態・方位表示・下部の道案内を継承した。背景は参考写真をもとに生成した仮の風景。UIはHTML/CSS/インラインSVGで構成し、画像に焼き込んでいない。

## 画面の3層

| 層 | 置くもの | 設計 |
|---|---|---|
| 実景 | カメラの風景 | 中央の視界を広く残す。見本では背景画像を使用 |
| 空間 | 地面の矢印、泉、炎、波紋、目的地ラベル | 接地点・向き・距離に対応させる想定。位置が不確かなときは退避 |
| 画面固定 | 状態、演出停止、地図への切替、ミニマップ、次の行動 | 文字を安定した位置に置き、実景から独立した濃い背景で読みやすくする |

## 場所とモチーフ

| 場所 | モチーフ | 体験・動き |
|---|---|---|
| ゴール・待ち合わせ | 光の泉 | 細い水柱と地面の波紋。遠くは小さく、接近すると輪郭が見え、到着で光が広がる |
| 喫煙所 | 小さな琥珀の炎 | 穏やかな揺れ。現実の火災に見える大きな炎や煙にせず、喫煙所の名前を常時添える |
| 音楽ステージ | 音の波紋 | 複数の楕円と音の柱がゆっくり呼吸する。音声を鳴らさなくても場所が伝わる |
| キッチン | 光の湯気 | 器の輪郭と細い湯気。暖色で食の場所を知らせる |
| 街の入口 | 光の門 | 光の輪郭だけのアーチ。現実の通り道を塞がず、入っていく期待をつくる |
| 記憶の場所 | 蛍の灯り | 琥珀と淡緑の小さな粒。みんなの記憶と自分の記憶を、実装時はラベル・公開範囲と対応させる |

名称やモチーフの割り当ては設計提案。実際の会場POIと対応を確定してから接続する。

## 状態と振る舞い

| 状態 | 空間表示 | 固定表示 |
|---|---|---|
| 案内中 | 控えめなモチーフ、進行方向に連なる矢印 | 次の行動、次の曲がり角、残距離 |
| もうすぐ | モチーフを少し大きく、足元の矢印を弱める | 残距離と、現実の目印を確かめる言葉 |
| 到着 | 矢印を消し、光の輪を広げる | 到着した場所、記憶を残すボタン |
| 測位不良 | 空間の矢印・ラベル・モチーフを一度消す | 位置確認、再調整、通常の地図への導線 |
| 演出停止 | 水や炎の動きを止める | 案内文と操作は継続 |
| AR利用不可 | 空間演出を使わない | 通常の地図案内へ切り替える |

距離スライダーの0m・18mは見本を切り替えるためだけの値。実GPSによる到着判定には使用しない。距離・位置精度・方位・接地点の情報と、現実の到着確認を本番仕様で決定する。

## 接地と重なり

地面上の薄い影、平たく投影された光の輪、上に立つモチーフを別々に描く。UI見本ではSVGを投影した見た目を示す。本番では空間位置、カメラ姿勢、地面の推定と結び付ける。

人物・階段・建物の裏に正しく隠す処理は、この見本には含まない。遮蔽を取得できない環境では小さな目印とラベルを優先し、実在物の背後まで見通せるような大きな演出は避ける。実景の障害物を検出したとは表示しない。

## 色・形・動き

- 泉：`#A7F4E2`、炎：`#FFD48C`、音：`#D7C8FF`、案内：`#F6D186`。
- 画面固定の背景：深い森の緑。実景が明るいときは「くっきり表示」で不透明にする。
- 目的地ラベルと主要操作は44px以上。色に加えて名前、形、状態の言葉を必ず添える。
- 水の輪は3.2秒、炎は2.2秒、音の波紋は3.4秒、湯気は3.2秒の穏やかな周期。強い明滅は使わない。
- OSの動きを減らす設定を尊重し、手動でも停止・静止を選べる。
- 自動音声、自動再生の音、振動はこの見本には含めない。演出の意味は無音でも成立させる。

## 追加した部品 73–92

固定ヘッダー／地面の光の矢印／目的地ラベル／ミニマップ／画面外の目印／泉／炎／音の波紋／湯気／光の門／記憶の蛍／道案内カード／到着の波紋／位置合わせ状態／測位不良／地面に合わせるガイド／接地表現／演出設定／通常案内への切替／周囲確認。

## 実装への引き継ぎ

`ar.css` と各部品のHTML・SVGが描画見本。`ar.js` は操作できるストーリーボードであり、位置計算・経路計算・実AR追跡を実装していない。

本番から渡す情報の想定は、目的地ID・名称・カテゴリ、残距離、次の操作、次の分岐、方位、位置と追跡の状態、AR利用可否、ユーザーが選んだ演出量。表示状態はこれらに応じて決める。内部の見本用距離やタイマーを、本番の測位判定へ流用しない。

現実のカメラ、GPS、センサー、地面への追従、実物による遮蔽、音声、投稿保存は未接続。対応端末と実会場で、位置ずれ・屋外の明るさ・発熱・バッテリー・歩行中の見やすさを別途確認する。

## ファイルと背景素材

- `ar.css`: 実景合成、固定HUD、空間モチーフ、アニメーション。
- `ar.js`: モチーフ、距離、状態、夕暮れ、動きを減らす、濃い表示の切り替え。
- `assets/ar-park.webp`: 800×1200のWeb用背景。写真をもとに画像生成ツールで作成した仮の風景。
- コピーしたAR部品は基本CSSと追加CSSに加えて`ar.css`が必要。SVGのIDと参照もコピー時に付け替える。

背景生成のプロンプト（built-in image generation）:

> Use case: photorealistic-natural. Asset type: clean real-world camera background for an interactive AR navigation UI prototype. The attached photograph is a reference for the outdoor Japanese park/campsite setting, NOT an image to reproduce with its smartphone. Create a crisp photorealistic portrait 1024x1536 scene viewed directly from pedestrian eye level looking ahead along a broad paved park path. Remove all phone, case, hand, UI, arrows, signs, text and overlays; the final image must be only the real environment. Preserve the reference's calm early-autumn Japanese campsite atmosphere: mossy/grey steps on the left, low wood railing near midground, trees framing both sides, small distant red festival canopy at upper left, muted olive and moss green foliage. The path is clear and unoccupied, covering the entire lower two thirds and tapering toward a vanishing point at approximately x50%, y42%. Keep a visible open patch of pavement at x50%,y53% for a virtual fountain to be added later in code. Broad natural late afternoon daylight, soft warm shadows, tactile asphalt, believable real mobile camera exposure. Make ground relatively evenly lit so pale cyan and amber holographic UI will show clearly. No magical effects, no fantasy objects, no people, no actual fountain, no flames, no virtual objects, no water, no typography, no logos, no phone bezel. Sharp environmental focus, real photography rather than illustration.
