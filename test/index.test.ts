import { describe, expect, it } from "vitest";
import { decodeEventLog, keccak256, toEventSelector, toHex } from "viem";
import { AssetManagerDiamondAbi } from "../abis/AssetManagerDiamond";

describe("ABI correctness", () => {
  it("CarbonSwap event hash matches on-chain observations", () => {
    const selector = toEventSelector(
      "CarbonSwap(address,address,address,uint256,uint256,uint256,address)",
    );
    expect(selector).toBe(
      "0xf17083d7d5e791e95a2edf4d1fdb334e98b313e9a129760f23d30d5f53fb9a52",
    );
  });

  it("CarbonRetiredViaRA event hash is computable", () => {
    const selector = toEventSelector(
      "CarbonRetiredViaRA(address,address,address,uint256,uint256,address,string)",
    );
    // Verify the hash is a valid 32-byte hex string
    expect(selector).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("CarbonSwap event decoding", () => {
  // Raw log from TX 0x4fb6c672... (block 42974582)
  const rawLog = {
    address:
      "0x1c24239309398220883207681602bff4d10fbde1" as `0x${string}`,
    topics: [
      "0xf17083d7d5e791e95a2edf4d1fdb334e98b313e9a129760f23d30d5f53fb9a52",
      "0x0000000000000000000000004d6fce4eb76f093f5948dcb7ff4364427d70bcb8",
      "0x000000000000000000000000f20cb470acda661ab02de3b7be43894e2ade0b1c",
      "0x0000000000000000000000006be329d0cec07bfac139b0b900d964ea0085a0d9",
    ] as readonly [`0x${string}`, ...`0x${string}`[]],
    data: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000078f0c58b2e5c7bfa58000000000000000000000000a9b36026075ee315ec339378f94ff3d5fe6bfb21" as `0x${string}`,
  };

  it("decodes indexed parameters from topics", () => {
    const decoded = decodeEventLog({
      abi: AssetManagerDiamondAbi,
      ...rawLog,
    });

    expect(decoded.eventName).toBe("CarbonSwap");
    expect(decoded.args.carbonClass.toLowerCase()).toBe(
      "0x4d6fce4eb76f093f5948dcb7ff4364427d70bcb8",
    );
    expect(decoded.args.credit.toLowerCase()).toBe(
      "0xf20cb470acda661ab02de3b7be43894e2ade0b1c",
    );
    expect(decoded.args.quoter.toLowerCase()).toBe(
      "0x6be329d0cec07bfac139b0b900d964ea0085a0d9",
    );
  });

  it("decodes non-indexed parameters from data", () => {
    const decoded = decodeEventLog({
      abi: AssetManagerDiamondAbi,
      ...rawLog,
    });

    expect(decoded.args.tonnageAmount).toBe(1000000000000000000n);
    expect(decoded.args.kvcmAmount).toBe(0x78f0c58b2e5c7bfa58n);
    expect(decoded.args.recipient.toLowerCase()).toBe(
      "0xa9b36026075ee315ec339378f94ff3d5fe6bfb21",
    );
  });

  it("decodes a second transaction for cross-validation", () => {
    // Raw log from TX 0xe57ee6a4... (block 42914479)
    const rawLog2 = {
      address:
        "0x1c24239309398220883207681602bff4d10fbde1" as `0x${string}`,
      topics: [
        "0xf17083d7d5e791e95a2edf4d1fdb334e98b313e9a129760f23d30d5f53fb9a52",
        "0x0000000000000000000000004d6fce4eb76f093f5948dcb7ff4364427d70bcb8",
        "0x000000000000000000000000f20cb470acda661ab02de3b7be43894e2ade0b1c",
        "0x0000000000000000000000006be329d0cec07bfac139b0b900d964ea0085a0d9",
      ] as readonly [`0x${string}`, ...`0x${string}`[]],
      data: "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011d375f1c5fd3fe700000000000000000000000000000000000000000000009c39531120eeb253c3000000000000000000000000e4d60c0376a3629f053bf46849733604832b87b5" as `0x${string}`,
    };

    const decoded = decodeEventLog({
      abi: AssetManagerDiamondAbi,
      ...rawLog2,
    });

    expect(decoded.eventName).toBe("CarbonSwap");
    expect(decoded.args.tonnageAmount).toBe(0x11d375f1c5fd3fe7n);
    expect(decoded.args.recipient.toLowerCase()).toBe(
      "0xe4d60c0376a3629f053bf46849733604832b87b5",
    );
  });
});

describe("CarbonSwap event structure", () => {
  it("has 3 indexed and 4 non-indexed parameters", () => {
    const carbonSwapEvent = AssetManagerDiamondAbi.find(
      (item) => item.type === "event" && item.name === "CarbonSwap",
    );
    expect(carbonSwapEvent).toBeDefined();
    const inputs = carbonSwapEvent!.inputs;
    const indexed = inputs.filter((i) => i.indexed);
    const nonIndexed = inputs.filter((i) => !i.indexed);
    expect(indexed).toHaveLength(3);
    expect(nonIndexed).toHaveLength(4);
  });

  it("CarbonRetiredViaRA has 3 indexed and 4 non-indexed parameters", () => {
    const retiredEvent = AssetManagerDiamondAbi.find(
      (item) => item.type === "event" && item.name === "CarbonRetiredViaRA",
    );
    expect(retiredEvent).toBeDefined();
    const inputs = retiredEvent!.inputs;
    const indexed = inputs.filter((i) => i.indexed);
    const nonIndexed = inputs.filter((i) => !i.indexed);
    expect(indexed).toHaveLength(3);
    expect(nonIndexed).toHaveLength(4);
  });
});
