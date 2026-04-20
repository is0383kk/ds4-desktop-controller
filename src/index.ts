import HID from "node-hid";
import { parseControllerData, ControllerState } from "./controller";
import { executeAction } from "./desktop";

const PS4_VENDOR_ID = 0x054c;
const PS4_PRODUCT_IDS = [
  0x05c4,
  0x09cc,
];

const POLL_INTERVAL_MS = 16;

function main() {
  console.log("PS4コントローラーを検索中...");

  const allDevices = HID.devices();
  const deviceInfo = allDevices.find(
    (d) => d.vendorId === PS4_VENDOR_ID && PS4_PRODUCT_IDS.includes(d.productId)
  );

  if (!deviceInfo) {
    console.error("PS4コントローラーが見つかりませんでした");
    console.log("接続されているデバイス一覧:");
    allDevices.forEach((d) => {
      console.log(`  - ${d.manufacturer ?? "不明"} / ${d.product ?? "不明"} (VID: 0x${d.vendorId.toString(16)}, PID: 0x${d.productId.toString(16)})`);
    });
    process.exit(1);
  }

  if (!deviceInfo.path) {
    console.error("デバイスのパスが取得できませんでした");
    process.exit(1);
  }

  console.log(`PS4コントローラーを発見: ${deviceInfo.product ?? "DualShock 4"}`);
  console.log(`パス: ${deviceInfo.path}`);

  const device = new HID.HID(deviceInfo.path);
  console.log("入力待機中... (Ctrl+C で終了)");

  let latestState: ControllerState | null = null;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  device.on("data", (data: Buffer) => {
    latestState = parseControllerData(data);
  });

  device.on("error", (err: Error) => {
    console.error("デバイスエラー:", err.message);
    if (pollTimer !== null) clearInterval(pollTimer);
    process.exit(1);
  });

  pollTimer = setInterval(() => {
    if (latestState === null) return;
    const state = latestState;
    executeAction(state).catch((err: Error) => {
      console.error("操作エラー:", err.message);
    });
  }, POLL_INTERVAL_MS);

  process.on("SIGINT", () => {
    if (pollTimer !== null) clearInterval(pollTimer);
    device.close();
    process.exit(0);
  });
}

main();
