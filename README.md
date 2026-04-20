# ps4-controller

PS4 DualShock 4 コントローラーを USB HID 経由で接続し、マウス・キーボード操作に変換するツール。

## 必要環境

- Windows 11
- Node.js v18 以上
- PS4 DualShock 4（USB 直接接続）

> DS4Windows などの仮想デバイスドライバーが有効な場合、USB HID として認識されないことがある。その場合は無効化してから接続すること。

## インストール

```powershell
git clone <リポジトリURL>
cd ps4-controller
npm install
npm link
```

`npm link` により、どのディレクトリからでも `ps4-controller` コマンドで起動できる。

## 使い方

```powershell
ps4-controller
```

コントローラーが認識されると入力待機状態になる。終了は `Ctrl+C`。

プロジェクトディレクトリから直接起動する場合:

```powershell
npm start
```

## デフォルトのボタン割り当て

### ボタン

| ボタン | 操作 |
|---|---|
| × | 左クリック |
| ○ | 右クリック |
| △ | Enter |
| □ | Backspace |
| 十字キー上下左右 | 矢印キー |
| L1 | Alt + Tab（ウィンドウ切り替え） |
| Options | Win キー（スタートメニュー） |

### スティック

| スティック | 操作 |
|---|---|
| 左スティック X/Y | マウスカーソル移動 |
| 右スティック Y 軸 | 縦スクロール |
| 右スティック X 軸 | 横スクロール |

## キーマップのカスタマイズ

ルートディレクトリの `keymap.json` を編集することで割り当てを変更できる。アプリを再起動すると反映される。

### アクション種別

```jsonc
// マウスクリック
{ "type": "mouseClick", "button": "left" | "right" }

// キー単押し
{ "type": "key", "key": "Enter" | "Backspace" | "Up" | "Down" | "Left" | "Right" | "Meta" | ... }

// ホットキー（複数キー同時押し）
{ "type": "hotkey", "keys": ["Alt", "Tab"] }
```

### スティック設定

```jsonc
// マウス移動（speed: ピクセル/フレーム の最大値）
{ "type": "mouseMove", "speed": 20 }

// スクロール（speed: スクロール量の係数）
{ "type": "scroll", "speed": 5 }
```

## アーキテクチャ

```
HID デバイス
    ↓ data イベント (Buffer)
parseControllerData()   ← src/controller.ts
    ↓ ControllerState
executeAction()         ← src/desktop.ts  (keymap.ts のキーマップを参照)
    ↓
@nut-tree-fork/nut-js (マウス・キーボード操作)
```

入力は 16ms（約 60fps）のポーリングで処理され、ボタンはエッジ検出（前フレームとの差分）により押下タイミングを検出する。

## ファイル構成

```
ps4-controller/
├── bin/
│   └── ps4-controller.js   # npm link 用エントリポイント
├── src/
│   ├── index.ts            # エントリポイント。HID 接続・ポーリングループ
│   ├── controller.ts       # Buffer → ControllerState のパース
│   ├── desktop.ts          # ControllerState → マウス・キーボード操作
│   └── keymap.ts           # keymap.json の型定義・ロード・バリデーション
├── keymap.json             # ボタン/スティック → アクションの設定
└── tsconfig.json
```

## 開発用コマンド

```powershell
# ウォッチモードで起動（ファイル変更時に自動再起動）
npm run dev

# TypeScript のビルド
npm run build

# 型チェックのみ
npx tsc --noEmit
```
