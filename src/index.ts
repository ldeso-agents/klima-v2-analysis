import { createPublicClient, http, type Log } from "viem";
import { base } from "viem/chains";
import { AssetManagerDiamondAbi } from "../abis/AssetManagerDiamond.js";
import * as fs from "node:fs";
import * as path from "node:path";

const CONTRACT = "0x1C24239309398220883207681602BfF4D10fbde1" as const;
const START_BLOCK = 42322068n;
const BATCH_SIZE = 10_000n;

const DATA_DIR = "data";
const CURSOR_PATH = path.join(DATA_DIR, "cursor.json");
const SWAPS_CSV = path.join(DATA_DIR, "carbon_swaps.csv");
const RETIREMENTS_CSV = path.join(DATA_DIR, "retirements.csv");

const SWAP_HEADER =
  "block_number,timestamp,tx_hash,log_index,carbon_class,credit,quoter,token_id,tonnage_amount,kvcm_amount,recipient\n";
const RETIREMENT_HEADER =
  "block_number,timestamp,tx_hash,log_index,carbon_class,credit,quoter,token_id,tonnage_amount,retiring_entity,retiring_reason\n";

const [swapEvent, retirementEvent] = AssetManagerDiamondAbi;

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function readCursor(): bigint {
  try {
    const data = JSON.parse(fs.readFileSync(CURSOR_PATH, "utf-8"));
    return BigInt(data.lastBlock);
  } catch {
    return START_BLOCK - 1n;
  }
}

function writeCursor(lastBlock: bigint): void {
  fs.writeFileSync(CURSOR_PATH, JSON.stringify({ lastBlock: Number(lastBlock) }) + "\n");
}

function ensureCsvHeader(filePath: string, header: string): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, header);
  }
}

async function getBlockTimestamps(
  client: ReturnType<typeof createPublicClient>,
  blockNumbers: bigint[],
): Promise<Map<bigint, bigint>> {
  const unique = [...new Set(blockNumbers)];
  const timestamps = new Map<bigint, bigint>();
  for (const num of unique) {
    const block = await client.getBlock({ blockNumber: num });
    timestamps.set(num, block.timestamp);
  }
  return timestamps;
}

async function main() {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("Set RPC_URL environment variable (e.g. RPC_URL=https://mainnet.base.org)");
    process.exit(1);
  }

  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  fs.mkdirSync(DATA_DIR, { recursive: true });
  ensureCsvHeader(SWAPS_CSV, SWAP_HEADER);
  ensureCsvHeader(RETIREMENTS_CSV, RETIREMENT_HEADER);

  const fromBlock = readCursor() + 1n;
  const head = await client.getBlockNumber();

  if (fromBlock > head) {
    console.log(`Already up to date (last indexed block: ${fromBlock - 1n}, chain head: ${head})`);
    return;
  }

  console.log(`Indexing blocks ${fromBlock} to ${head}...`);

  let totalSwaps = 0;
  let totalRetirements = 0;

  for (let batchStart = fromBlock; batchStart <= head; batchStart += BATCH_SIZE) {
    const batchEnd = batchStart + BATCH_SIZE - 1n < head ? batchStart + BATCH_SIZE - 1n : head;

    const [swapLogs, retirementLogs] = await Promise.all([
      client.getLogs({
        address: CONTRACT,
        event: swapEvent,
        fromBlock: batchStart,
        toBlock: batchEnd,
      }),
      client.getLogs({
        address: CONTRACT,
        event: retirementEvent,
        fromBlock: batchStart,
        toBlock: batchEnd,
      }),
    ]);

    if (swapLogs.length > 0 || retirementLogs.length > 0) {
      const allBlockNumbers = [
        ...swapLogs.map((l) => l.blockNumber),
        ...retirementLogs.map((l) => l.blockNumber),
      ];
      const timestamps = await getBlockTimestamps(client, allBlockNumbers);

      if (swapLogs.length > 0) {
        const rows = swapLogs.map((log) => {
          const ts = timestamps.get(log.blockNumber)!;
          return [
            log.blockNumber,
            ts,
            log.transactionHash,
            log.logIndex,
            log.args.carbonClass,
            log.args.credit,
            log.args.quoter,
            log.args.tokenId,
            log.args.tonnageAmount,
            log.args.kvcmAmount,
            log.args.recipient,
          ].join(",") + "\n";
        });
        fs.appendFileSync(SWAPS_CSV, rows.join(""));
        totalSwaps += swapLogs.length;
      }

      if (retirementLogs.length > 0) {
        const rows = retirementLogs.map((log) => {
          const ts = timestamps.get(log.blockNumber)!;
          return [
            log.blockNumber,
            ts,
            log.transactionHash,
            log.logIndex,
            log.args.carbonClass,
            log.args.credit,
            log.args.quoter,
            log.args.tokenId,
            log.args.tonnageAmount,
            log.args.retiringEntity,
            csvEscape(log.args.retiringReason),
          ].join(",") + "\n";
        });
        fs.appendFileSync(RETIREMENTS_CSV, rows.join(""));
        totalRetirements += retirementLogs.length;
      }
    }

    writeCursor(batchEnd);

    if (batchEnd < head) {
      const progress = Number(batchEnd - fromBlock) / Number(head - fromBlock);
      console.log(
        `  ${batchStart}..${batchEnd} (${(progress * 100).toFixed(1)}%) — ${totalSwaps} swaps, ${totalRetirements} retirements so far`,
      );
    }
  }

  console.log(
    `Done. Indexed blocks ${fromBlock} to ${head}: ${totalSwaps} swaps, ${totalRetirements} retirements.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
