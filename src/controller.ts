export interface StickState {
  x: number; // 0-255, 中立値 128
  y: number; // 0-255, 中立値 128
}

export interface ControllerState {
  leftStick: StickState;
  rightStick: StickState;
  buttons: {
    // 十字キー (buttons1 の下位4bit)
    dpadUp: boolean;
    dpadRight: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    // フェイスボタン (buttons1 の上位4bit)
    square: boolean;
    cross: boolean;
    circle: boolean;
    triangle: boolean;
    // ショルダー / トリガー (buttons2)
    l1: boolean;
    r1: boolean;
    l2: boolean;
    r2: boolean;
    share: boolean;
    options: boolean;
    l3: boolean;
    r3: boolean;
  };
  // トリガー アナログ値
  l2Analog: number; // 0-255
  r2Analog: number; // 0-255
}

// 十字キーは4bitエンコード: 0=上, 1=右上, 2=右, 3=右下, 4=下, 5=左下, 6=左, 7=左上, 8=ニュートラル
function parseDpad(value: number): Pick<ControllerState["buttons"], "dpadUp" | "dpadRight" | "dpadDown" | "dpadLeft"> {
  const dpad = value & 0x0f;
  return {
    dpadUp:    dpad === 0 || dpad === 1 || dpad === 7,
    dpadRight: dpad === 1 || dpad === 2 || dpad === 3,
    dpadDown:  dpad === 3 || dpad === 4 || dpad === 5,
    dpadLeft:  dpad === 5 || dpad === 6 || dpad === 7,
  };
}

export function parseControllerData(data: Buffer): ControllerState {
  const lx = data[1] ?? 128;
  const ly = data[2] ?? 128;
  const rx = data[3] ?? 128;
  const ry = data[4] ?? 128;
  const buttons1 = data[5] ?? 0;
  const buttons2 = data[6] ?? 0;
  const l2Analog = data[8] ?? 0;
  const r2Analog = data[9] ?? 0;

  return {
    leftStick:  { x: lx, y: ly },
    rightStick: { x: rx, y: ry },
    buttons: {
      ...parseDpad(buttons1),
      square:   (buttons1 & 0x10) !== 0,
      cross:    (buttons1 & 0x20) !== 0,
      circle:   (buttons1 & 0x40) !== 0,
      triangle: (buttons1 & 0x80) !== 0,
      l1:       (buttons2 & 0x01) !== 0,
      r1:       (buttons2 & 0x02) !== 0,
      l2:       (buttons2 & 0x04) !== 0,
      r2:       (buttons2 & 0x08) !== 0,
      share:    (buttons2 & 0x10) !== 0,
      options:  (buttons2 & 0x20) !== 0,
      l3:       (buttons2 & 0x40) !== 0,
      r3:       (buttons2 & 0x80) !== 0,
    },
    l2Analog,
    r2Analog,
  };
}
