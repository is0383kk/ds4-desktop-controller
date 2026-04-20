import fs from "fs";
import path from "path";

export interface MouseClickAction {
  type: "mouseClick";
  button: "left" | "right";
}

export interface KeyAction {
  type: "key";
  key: string;
}

export interface HotkeyAction {
  type: "hotkey";
  keys: string[];
}

export type ButtonAction = MouseClickAction | KeyAction | HotkeyAction;

export interface MouseMoveConfig {
  type: "mouseMove";
  speed: number;
}

export interface ScrollConfig {
  type: "scroll";
  speed: number;
}

export type StickConfig = MouseMoveConfig | ScrollConfig;

export interface KeymapConfig {
  buttons: Partial<Record<string, ButtonAction>>;
  sticks: {
    left?: StickConfig;
    right?: StickConfig;
  };
}

const DEFAULT_KEYMAP_PATH = path.resolve(process.cwd(), "keymap.json");

function validateButtonAction(value: unknown, key: string): ButtonAction {
  if (typeof value !== "object" || value === null) {
    throw new Error(`keymap.buttons.${key}: オブジェクトではありません`);
  }
  const obj = value as Record<string, unknown>;
  const type = obj["type"];

  if (type === "mouseClick") {
    if (obj["button"] !== "left" && obj["button"] !== "right") {
      throw new Error(`keymap.buttons.${key}.button: "left" または "right" が必要です`);
    }
    return { type: "mouseClick", button: obj["button"] };
  }

  if (type === "key") {
    if (typeof obj["key"] !== "string") {
      throw new Error(`keymap.buttons.${key}.key: 文字列が必要です`);
    }
    return { type: "key", key: obj["key"] };
  }

  if (type === "hotkey") {
    if (!Array.isArray(obj["keys"]) || !obj["keys"].every((k) => typeof k === "string")) {
      throw new Error(`keymap.buttons.${key}.keys: 文字列配列が必要です`);
    }
    return { type: "hotkey", keys: obj["keys"] as string[] };
  }

  throw new Error(`keymap.buttons.${key}.type: 未対応の値 "${String(type)}"`);
}

function validateStickConfig(value: unknown, key: string): StickConfig {
  if (typeof value !== "object" || value === null) {
    throw new Error(`keymap.sticks.${key}: オブジェクトではありません`);
  }
  const obj = value as Record<string, unknown>;
  const type = obj["type"];

  if (type !== "mouseMove" && type !== "scroll") {
    throw new Error(`keymap.sticks.${key}.type: "mouseMove" または "scroll" が必要です`);
  }
  if (typeof obj["speed"] !== "number") {
    throw new Error(`keymap.sticks.${key}.speed: 数値が必要です`);
  }
  return { type, speed: obj["speed"] };
}

export function loadKeymap(filePath?: string): KeymapConfig {
  const target = filePath ?? DEFAULT_KEYMAP_PATH;
  const raw = fs.readFileSync(target, "utf-8");
  const json = JSON.parse(raw) as Record<string, unknown>;

  const buttonsRaw = json["buttons"] as Record<string, unknown> | undefined ?? {};
  const sticksRaw = json["sticks"] as Record<string, unknown> | undefined ?? {};

  const buttons: KeymapConfig["buttons"] = {};
  for (const [k, v] of Object.entries(buttonsRaw)) {
    buttons[k] = validateButtonAction(v, k);
  }

  const sticks: KeymapConfig["sticks"] = {};
  if (sticksRaw["left"] !== undefined) {
    sticks.left = validateStickConfig(sticksRaw["left"], "left");
  }
  if (sticksRaw["right"] !== undefined) {
    sticks.right = validateStickConfig(sticksRaw["right"], "right");
  }

  return { buttons, sticks };
}
