export const AssetManagerDiamondAbi = [
  {
    type: "event",
    name: "CarbonSwap",
    inputs: [
      { name: "carbonClass", type: "address", indexed: true },
      { name: "credit", type: "address", indexed: true },
      { name: "quoter", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "tonnageAmount", type: "uint256", indexed: false },
      { name: "kvcmAmount", type: "uint256", indexed: false },
      { name: "recipient", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CarbonRetiredViaRA",
    inputs: [
      { name: "carbonClass", type: "address", indexed: true },
      { name: "credit", type: "address", indexed: true },
      { name: "quoter", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "tonnageAmount", type: "uint256", indexed: false },
      { name: "retiringEntity", type: "address", indexed: false },
      { name: "retiringReason", type: "string", indexed: false },
    ],
  },
] as const;
