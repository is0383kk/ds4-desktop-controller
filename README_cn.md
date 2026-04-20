<table>
	<thead>
    	<tr>
      		<th style="text-align:center"><a href="./README.md">English</a></th>
          <th style="text-align:center">Chinese</th>
      		<th style="text-align:center"><a href="./README_ja.md">日本語</a></th>
    	</tr>
  	</thead>
</table>

# ps4-controller

通过 USB HID 连接 PS4 DualShock 4 手柄，并将其输入转换为鼠标和键盘操作的工具。

## 环境要求

- Windows 11
- Node.js v18 及以上
- PS4 DualShock 4（USB 直接连接）

> 如果启用了 DS4Windows 等虚拟设备驱动程序，手柄可能无法被识别为 USB HID 设备。请在连接前将其禁用。

## 安装

```powershell
git clone <仓库URL>
cd ps4-controller
npm install
npm link
```

执行 `npm link` 后，可在任意目录使用 `ps4-controller` 命令启动工具。

## 使用方法

```powershell
ps4-controller
```

手柄被识别后，工具进入输入监听状态。按 `Ctrl+C` 退出。

若要从项目目录直接启动：

```powershell
npm start
```

## 默认按键映射

### 按钮

| 按钮 | 操作 |
|---|---|
| × | 左键单击 |
| ○ | 右键单击 |
| △ | Enter |
| □ | Backspace |
| 十字键（上/下/左/右） | 方向键 |
| L1 | Alt + Tab（切换窗口） |
| Options | Win 键（开始菜单） |

### 摇杆

| 摇杆 | 操作 |
|---|---|
| 左摇杆 X/Y | 鼠标光标移动 |
| 右摇杆 Y 轴 | 垂直滚动 |
| 右摇杆 X 轴 | 水平滚动 |

## 按键映射自定义

编辑根目录的 `keymap.json` 即可修改映射。重启应用后生效。

### 操作类型

```jsonc
// 鼠标点击
{ "type": "mouseClick", "button": "left" | "right" }

// 单键按下
{ "type": "key", "key": "Enter" | "Backspace" | "Up" | "Down" | "Left" | "Right" | "Meta" | ... }

// 热键（多键同时按下）
{ "type": "hotkey", "keys": ["Alt", "Tab"] }
```

### 摇杆设置

```jsonc
// 鼠标移动（speed: 每帧最大像素数）
{ "type": "mouseMove", "speed": 20 }

// 滚动（speed: 滚动量系数）
{ "type": "scroll", "speed": 5 }
```

## 架构

```
HID 设备
    ↓ data 事件 (Buffer)
parseControllerData()   ← src/controller.ts
    ↓ ControllerState
executeAction()         ← src/desktop.ts  (参考 keymap.ts 中的键映射)
    ↓
@nut-tree-fork/nut-js (鼠标和键盘操作)
```

输入以 16ms 轮询（约 60fps）处理，按钮通过边缘检测（与前一帧的差异）来识别按下时机。

## 文件结构

```
ps4-controller/
├── bin/
│   └── ps4-controller.js   # npm link 用入口点
├── src/
│   ├── index.ts            # 入口点。HID 连接和轮询循环
│   ├── controller.ts       # Buffer → ControllerState 解析
│   ├── desktop.ts          # ControllerState → 鼠标和键盘操作
│   └── keymap.ts           # keymap.json 类型定义、加载和验证
├── keymap.json             # 按钮/摇杆 → 操作配置
└── tsconfig.json
```

## 开发命令

```powershell
# 以监听模式启动（文件更改时自动重启）
npm run dev

# 编译 TypeScript
npm run build

# 仅进行类型检查
npx tsc --noEmit
```
