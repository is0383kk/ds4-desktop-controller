import { mouse, keyboard, Key, Button } from "@nut-tree-fork/nut-js";
import { ControllerState, StickState } from "./controller";
import { KeymapConfig, loadKeymap, ButtonAction, StickConfig } from "./keymap";

const DEAD_ZONE = 20;
const STICK_CENTER = 128;

mouse.config.autoDelayMs = 0;
keyboard.config.autoDelayMs = 0;

let keymap: KeymapConfig = loadKeymap();

export function reloadKeymap(filePath?: string): void {
  keymap = loadKeymap(filePath);
}

function stickOffset(value: number): number {
  const offset = value - STICK_CENTER;
  return Math.abs(offset) < DEAD_ZONE ? 0 : offset;
}

function offsetToSpeed(offset: number, maxSpeed: number): number {
  return Math.round((offset / STICK_CENTER) * maxSpeed);
}

const KEY_MAP: Record<string, Key> = {
  Enter:     Key.Return,
  Backspace: Key.Backspace,
  Up:        Key.Up,
  Down:      Key.Down,
  Left:      Key.Left,
  Right:     Key.Right,
  Alt:       Key.LeftAlt,
  Tab:       Key.Tab,
  Meta:      Key.LeftWin,
  Shift:     Key.LeftShift,
  Ctrl:      Key.LeftControl,
};

function resolveKey(keyName: string): Key {
  const resolved = KEY_MAP[keyName];
  if (resolved === undefined) {
    throw new Error(`未対応のキー名: ${keyName}`);
  }
  return resolved;
}

async function executeButtonAction(action: ButtonAction): Promise<void> {
  if (action.type === "mouseClick") {
    if (action.button === "left") {
      await mouse.leftClick();
    } else {
      await mouse.rightClick();
    }
    return;
  }

  if (action.type === "key") {
    const k = resolveKey(action.key);
    await keyboard.pressKey(k);
    await keyboard.releaseKey(k);
    return;
  }

  if (action.type === "hotkey") {
    const keys = action.keys.map(resolveKey);
    await keyboard.pressKey(...keys);
    await keyboard.releaseKey(...keys);
    return;
  }
}

function scrollAmount(delta: number, speed: number): number {
  return Math.max(1, Math.round(Math.abs(delta) * (speed / 100)));
}

async function handleMouseMove(stick: StickState, config: StickConfig): Promise<void> {
  if (config.type !== "mouseMove") return;
  const dx = stickOffset(stick.x);
  const dy = stickOffset(stick.y);
  if (dx === 0 && dy === 0) return;

  const current = await mouse.getPosition();
  await mouse.setPosition({
    x: current.x + offsetToSpeed(dx, config.speed),
    y: current.y + offsetToSpeed(dy, config.speed),
  });
}

async function handleScroll(stick: StickState, config: StickConfig): Promise<void> {
  if (config.type !== "scroll") return;
  const dx = stickOffset(stick.x);
  const dy = stickOffset(stick.y);

  if (dy !== 0) {
    const amount = scrollAmount(dy, config.speed);
    if (dy > 0) {
      await mouse.scrollDown(amount);
    } else {
      await mouse.scrollUp(amount);
    }
  }

  if (dx !== 0) {
    const amount = scrollAmount(dx, config.speed);
    if (dx > 0) {
      await mouse.scrollRight(amount);
    } else {
      await mouse.scrollLeft(amount);
    }
  }
}

let prevButtons: ControllerState["buttons"] | null = null;

function isPressed(
  current: ControllerState["buttons"],
  key: keyof ControllerState["buttons"]
): boolean {
  if (!prevButtons) return false;
  return current[key] && !prevButtons[key];
}

async function handleButtonActions(state: ControllerState): Promise<void> {
  const btn = state.buttons;
  const buttonKeys = Object.keys(btn) as (keyof ControllerState["buttons"])[];

  for (const key of buttonKeys) {
    if (!isPressed(btn, key)) continue;
    const action = keymap.buttons[key];
    if (!action) continue;
    await executeButtonAction(action);
  }

  prevButtons = { ...btn };
}

export async function executeAction(state: ControllerState): Promise<void> {
  const leftConfig = keymap.sticks.left;
  const rightConfig = keymap.sticks.right;

  const promises: Promise<void>[] = [handleButtonActions(state)];
  if (leftConfig)  promises.push(handleMouseMove(state.leftStick, leftConfig));
  if (rightConfig) promises.push(handleScroll(state.rightStick, rightConfig));
  await Promise.all(promises);
}
