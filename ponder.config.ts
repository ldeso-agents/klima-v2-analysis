import { createConfig } from "ponder";
import { AssetManagerDiamondAbi } from "./abis/AssetManagerDiamond";

export default createConfig({
  chains: {
    base: {
      id: 8453,
      rpc: process.env.PONDER_RPC_URL_8453,
    },
  },
  contracts: {
    AssetManager: {
      abi: AssetManagerDiamondAbi,
      chain: "base",
      address: "0x1C24239309398220883207681602BfF4D10fbde1",
      startBlock: 42322068,
    },
  },
});
