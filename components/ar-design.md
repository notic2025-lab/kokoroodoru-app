# 気配をたどる — こころ踊る街 / Experience 04

[体験プロトタイプ](https://notic2025-lab.github.io/kokoroodoru-app/components/experience/) · [20のUI部品](https://notic2025-lab.github.io/kokoroodoru-app/components/#ar-navigation)

## コンセプト

**この道の先に、誰かがいる。**

ARを、場所に記号を貼るためだけに使わない。人が集う、休む、音を聴く、食べる、街へ入る、記憶を残す。それぞれの場所で起きる営みを、風景に宿る「気配」として可視化する。

現実の景色を主役にしたまま、入口から出会いまでの視線を設計する。道に沿う光、場所の気配、到着後の小さな灯りを、同じ光の表現でつなぐ。目標は「画面をずっと見続ける」ことではなく、「画面を通して現地に関心を持ち、顔を上げる」こと。

## 前案から変えたこと

| 前案 | 今回の決定 | 体験への意味 |
|---|---|---|
| 泉・炎のアイコンを選ぶ部品集 | 入口から到着までを進める4場面 | 部品より先に、時間の流れと視線を設計 |
| 大きな連続矢印 | 道に沿う細い光＋画面下の明確な方向 | 実景の道を見ながら、次の一手を理解 |
| 常時ミニマップ・大きなカード | 必要なときに開く地図・画面の上下に寄せた案内 | 中央を人や風景のために空ける |
| 色別のファンタジーオブジェクト | 一つの光の素材から生まれる6つのふるまい | 場所が変わっても同じ街だと感じる |
| 到着の祝い・達成表示 | 経路と距離を消し、現地へ視線を返す | ナビの終わりが実際の体験の始まりになる |
| その場限りの装飾 | 自分の灯りを一つ置く | 場所と自分の関係を残す |

## 体験の時間設計

| 場面 | 空間の表現 | UI | 人にしてほしいこと |
|---|---|---|---|
| 01 ひらく | 地面の一点にごく小さい光。経路はまだ出さない | 「街に入る」 | 景色を見たうえで、自分で体験を始める |
| 02 たどる | 道に沿う細い線。光が先へ流れ、遠くの場所は小さな気配 | 次の分岐まで20m、方向、目的地まで60m | 現実の道を見て進む |
| 03 みつける | 光が場所の輪郭になる。経路は弱くなり、名前を添える | 目的地まで12m、目印の説明 | 気配と実際の場所を結びつける |
| 04 居合わせる | 経路が消える。場所の光は弱まり、接地する輪が残る | 距離表示を消す。場所名、灯りを残す、地図に戻る | 画面を下ろし、実際の人や場所へ関心を向ける |

プレビューは手動のストーリーボード。60m・20m・12mは場面説明用で、到着判定・GPS精度の閾値ではない。入口は現在位置を測定した状態ではない。

巨大Q-CUBEを入口体験とつなぐ場合は、QRを読んだ直後に01へ遷移させる案が考えられる。ただし設置場所・入口配置・起動導線は未確定として扱い、今回のデザインが実際の配置を決めるものではない。

## 光の素材と場所の意味

| 種類 | 営み | 形と動き | 地面との関係 |
|---|---|---|---|
| 泉 | 集う・待つ | 多数の細い線が上へ流れ、輪が外へ広がる | 広い、浅い反射と水の輪 |
| 熾火 | ひと息つく | 低い位置で、小さくゆらぐ | 狭い接地面と琥珀のにじみ |
| 共鳴 | 音を聴く | 薄い水平の波が重なり、静かに広がる | 地面に平行な波。音声連動は未実装 |
| 湯気 | 食べる | 細い線が上へほどける | 低い位置から立ち上がる |
| 光の境界 | 街に入る | 薄い輪郭が立ち上がり、向こうの景色を残す | 実際の入口の両側に接点を持つ想定 |
| 残り灯 | 記憶を残す | いくつかの点が異なる高さに留まる | 同じ場所に集まり、数を抑える |

炎を大きな実火のようにせず、喫煙所という名称と低い光の形を併用する。泉・ステージ・キッチン等の名称は仮。現地POIと名称・カテゴリを確定する必要がある。

## 実景と重ねる規則

1. **接点を先に作る。** 薄い影、地面への淡い反射、平たい輪、そこから立ち上がる光の順に組み立てる。
2. **道の形を優先する。** プレビューの線は写真に合わせた構図。実装では測定済み経路の中心線を使い、見栄えのために実際の通行経路を曲げない。
3. **距離で情報の粒度を変える。** 遠くは低密度の気配、近くは場所の輪郭。実装時の実距離による投影に加え、表現の詳細度を調整する。プレビューのscaleをメートルに換算しない。
4. **追跡が怪しいときは消す。** 地面と合わない光の道を見せ続けない。空間の演出を退かせ、実景・位置確認・地図へ戻す。
5. **実在物との重なりを正しく扱う。** カメラ姿勢・地面・遮蔽を取得できる場合に接続。取得できない環境で、人物や建物の裏側に光が正しく隠れると約束しない。
6. **表示を取り除く選択を残す。** 実景のみ、静止、濃い案内背景、地図案内を用意する。

背景画像と空間SVGは同じ800×1200の座標と同じアスペクト比の切り抜きを使う。画面固定の文字は別レイヤー。これは写真上での整合であり、実AR追跡ではない。

## 動きと明るさ

- 街に入る：光の道を1.6秒で現す。自動で次の場面へ進めない。
- 気配の変化：1.4秒の緩やかな変化。画面固定の案内は状態変化時に即時更新。
- 光の道：10秒周期で先へ流れる。大きな点滅を使わない。
- 泉：上昇する細粒3.6秒、地面の輪7秒。熾火4.8秒。共鳴6秒。湯気6秒。境界7秒。残り灯6秒。
- 色：水・波・境界は白に近い石灰色、火は淡い琥珀。色数を増やさず、運動方向と高さで区別する。
- 昼は輪郭と名称を読ませ、夕暮れは光量を抑えて景色に馴染ませる。写真の「夕暮れ」は比較用フィルターで、環境光推定ではない。
- OSの動きを減らす設定を尊重する。手動停止では光のアニメーションを止め、案内と場面操作を維持する。
- 音・振動は未接続。将来追加するなら本人が選べる補助とし、無音でも道案内を成立させる。

## 状態と操作

- 4場面：体験内の開始ボタン、前後ボタン、場面一覧で操作。
- 場所切替：同じ場面のまま6種類を比較。場面を勝手に飛ばさない。
- 実景比較：ARと固定表示を一時的に取り除く。隠れた操作はフォーカス対象から外す。
- 到着後の灯り：1回の操作で1つ表示し、重複追加を防止。見本なので永続保存しない。最初からやり直す／場所を変えるとリセット。
- 測位不良：光・経路・ラベルを消す。「地図で確かめる」を優先。位置が合った場面への復帰は明示的なデモ操作で、GPS回復を偽装しない。
- 地図：手描きの概念図。実会場の経路ではない。ARへ復帰すると元の場面を維持。
- 設定と場所の説明：ネイティブdialog。Escapeと閉じる操作、起点へフォーカス復帰。

## 再利用する20部品

73 景色を遮らないヘッダー / 74 光の道 / 75 場所の名前 / 76 必要なときに開く地図 / 77 画面外の気配 / 78 泉 / 79 熾火 / 80 共鳴 / 81 湯気 / 82 境界 / 83 残り灯 / 84 次の一手の案内 / 85 到着後の案内 / 86 位置の確かさ / 87 測位不良 / 88 景色との位置合わせ / 89 接地表現 / 90 表示設定 / 91 実景に戻す選択 / 92 自分の灯り。

## 実アプリへの引き継ぎ

- 本番から渡す値：目的地ID・名称・カテゴリ、現在位置、カメラ姿勢、経路形状、次の分岐・操作・距離、目的地までの距離、追跡品質、地面・遮蔽の利用可否、実到着確認、ユーザーの表示設定。
- 場面02→03→04：本番の測位仕様と現実の到着確認から決める。このJSの場面番号・固定距離・拡大率を判定ロジックに使用しない。
- 追跡品質：GPSだけで地面に精密固定できるものとして扱わない。必要な精度に応じて、現地アンカー／視覚位置合わせ／対応AR基盤を決定する。
- 経路表示：実際の曲がり角では曲がる方向を明示する。光の流れだけに判断を任せず、固定の案内と通常地図を併用。
- 投稿：既存の保存先・認証・公開範囲へ接続する。光の数は公開可否を確認した記憶だけから構成する。表示上限・集約は現場の密度を見て決める。
- 現地レビュー：位置ずれ、階段・地形、逆光、混雑時の見え方、停止中と歩行中、端末性能を実機で確認。未対応端末では通常地図の導線を使う。

## ファイル

- `experience/index.html`：4場面、操作、コンセプト、6素材と設計意図。
- `experience/experience.css`：体験とレビュー画面。埋込・スマホ・デスクトップ。
- `experience/experience.js`：手動ストーリーボード。センサー、通信、永続保存を使わない。
- `ar-world.css`：部品集と体験で共有する光の動き。
- `ar.css` / `ar.js`：部品集の20部品と表示設定。
- `assets/ar-park.webp`：前版で参考写真から生成した仮背景。今回追加の画像生成は行っていない。

部品のコピーは `components.css`、`extended.css`、`ar.css`、`ar-world.css` と組み合わせる。SVG IDと内部参照はコピー時に付け替える。動作はアプリの状態に接続する。

## 背景素材の生成履歴

背景生成のプロンプト（built-in image generation）:

> Use case: photorealistic-natural. Asset type: clean real-world camera background for an interactive AR navigation UI prototype. The attached photograph is a reference for the outdoor Japanese park/campsite setting, NOT an image to reproduce with its smartphone. Create a crisp photorealistic portrait 1024x1536 scene viewed directly from pedestrian eye level looking ahead along a broad paved park path. Remove all phone, case, hand, UI, arrows, signs, text and overlays; the final image must be only the real environment. Preserve the reference's calm early-autumn Japanese campsite atmosphere: mossy/grey steps on the left, low wood railing near midground, trees framing both sides, small distant red festival canopy at upper left, muted olive and moss green foliage. The path is clear and unoccupied, covering the entire lower two thirds and tapering toward a vanishing point at approximately x50%, y42%. Keep a visible open patch of pavement at x50%,y53% for a virtual fountain to be added later in code. Broad natural late afternoon daylight, soft warm shadows, tactile asphalt, believable real mobile camera exposure. Make ground relatively evenly lit so pale cyan and amber holographic UI will show clearly. No magical effects, no fantasy objects, no people, no actual fountain, no flames, no virtual objects, no water, no typography, no logos, no phone bezel. Sharp environmental focus, real photography rather than illustration.
