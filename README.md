<table>
	<thead>
    	<tr>
      		<th style="text-align:center">English</th>
          <th style="text-align:center"><a href="./README_cn.md">Chinese</a></th>
      		<th style="text-align:center"><a href="./README_ja.md">日本語</a></th>
    	</tr>
  	</thead>
</table>

# ds4-desktop-controller

A tool that connects a PS4 DualShock 4 controller via USB HID and maps its input to mouse and keyboard actions.

## Requirements

- Windows 11
- Node.js v18 or later
- PS4 DualShock 4 (direct USB connection)

> If a virtual device driver such as DS4Windows is active, the controller may not be recognized as a USB HID device. Disable it before connecting.

## Installation

```powershell
git clone https://github.com/is0383kk/ds4-desktop-controller.git
cd ps4-controller
npm install
npm link
```

After `npm link`, you can launch the tool with the `ps4-controller` command from any directory.

## Usage

```powershell
ps4-controller
```

Once the controller is recognized, the tool enters input-listening mode. Press `Ctrl+C` to exit.

To launch directly from the project directory:

```powershell
npm start
```

## Default Button Mappings

### Buttons

| Button | Action |
|---|---|
| × | Left click |
| ○ | Right click |
| △ | Enter |
| □ | Backspace |
| D-pad (up/down/left/right) | Arrow keys |
| L1 | Alt + Tab (window switch) |
| Options | Win key (Start menu) |

### Sticks

| Stick | Action |
|---|---|
| Left stick X/Y | Mouse cursor movement |
| Right stick Y axis | Vertical scroll |
| Right stick X axis | Horizontal scroll |

## Keymap Customization

Edit `keymap.json` in the root directory to change the mappings. Restart the app to apply changes.

### Action Types

```jsonc
// Mouse click
{ "type": "mouseClick", "button": "left" | "right" }

// Single key press
{ "type": "key", "key": "Enter" | "Backspace" | "Up" | "Down" | "Left" | "Right" | "Meta" | ... }

// Hotkey (multiple keys simultaneously)
{ "type": "hotkey", "keys": ["Alt", "Tab"] }
```

### Stick Settings

```jsonc
// Mouse movement (speed: max pixels per frame)
{ "type": "mouseMove", "speed": 20 }

// Scroll (speed: scroll amount multiplier)
{ "type": "scroll", "speed": 5 }
```

## Architecture

```
HID Device
    ↓ data event (Buffer)
parseControllerData()   ← src/controller.ts
    ↓ ControllerState
executeAction()         ← src/desktop.ts  (references keymap from keymap.ts)
    ↓
@nut-tree-fork/nut-js (mouse & keyboard operations)
```

Input is processed with 16ms polling (~60fps). Button presses are detected via edge detection (diff from previous frame).

## File Structure

```
ps4-controller/
├── bin/
│   └── ps4-controller.js   # Entry point for npm link
├── src/
│   ├── index.ts            # Entry point. HID connection & polling loop
│   ├── controller.ts       # Buffer → ControllerState parser
│   ├── desktop.ts          # ControllerState → mouse & keyboard actions
│   └── keymap.ts           # keymap.json type definitions, loading & validation
├── keymap.json             # Button/stick → action configuration
└── tsconfig.json
```

## Development Commands

```powershell
# Launch in watch mode (auto-restart on file changes)
npm run dev

# Build TypeScript
npm run build

# Type check only
npx tsc --noEmit
```
