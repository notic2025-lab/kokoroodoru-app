# 心踊る街 | MEMORIAL QR

https://notic2025-lab.github.io/kokoroodoru-app/

Published application assets. Source is managed separately.

## UI部品集

- [公開ページ](https://notic2025-lab.github.io/kokoroodoru-app/components/)
- [デザインの参照元](https://notic2025-lab.github.io/kokoroodoru-design/?fix=dialog8)

`components/` はビルド不要の独立したデザイン部品集です。72種類の部品、昼／夜のテーマ、スマホ幅プレビュー、HTMLコピーを含みます。入力・写真・位置情報・記憶の保存はデモでは行いません。

- `components/index.html`: 部品見本とインラインSVGアイコン
- `components/components.css`: 共通トークン、再利用可能な `ui-*` クラス、一覧のレイアウト
- `components/components.js`: 見本の切り替え、ダイアログ、HTMLコピー
- `components/extended.css` / `components/extended.js`: 追加部品、検索、ローカル操作
- `components/catalog.json`: 全部品の番号・名称・状態
- [詳しい使い方と部品一覧](components/README.md)

コピーしたHTMLには `components.css` と `extended.css` が必要です。アプリへの組み込み時は操作処理を接続し、フォームのIDやラジオボタンのnameを重複させないでください。夜の配色は親要素の `data-theme="night"` で指定できます。フォントはGoogle Fontsから読み込み、取得できない場合はシステムフォントを使います。

このリポジトリには公開用アセットのみがあります。別管理のソースから再公開する際は、追加した `components/` も公開成果物に含めてください。
