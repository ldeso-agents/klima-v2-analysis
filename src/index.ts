import { ponder } from "ponder:registry";
import { carbonSwap, retirement } from "ponder:schema";

ponder.on("AssetManager:CarbonSwap", async ({ event, context }) => {
  await context.db.insert(carbonSwap).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    carbonClass: event.args.carbonClass,
    credit: event.args.credit,
    quoter: event.args.quoter,
    tokenId: event.args.tokenId,
    tonnageAmount: event.args.tonnageAmount,
    kvcmAmount: event.args.kvcmAmount,
    recipient: event.args.recipient,
  });
});

ponder.on("AssetManager:CarbonRetiredViaRA", async ({ event, context }) => {
  await context.db.insert(retirement).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
    carbonClass: event.args.carbonClass,
    credit: event.args.credit,
    quoter: event.args.quoter,
    tokenId: event.args.tokenId,
    tonnageAmount: event.args.tonnageAmount,
    retiringEntity: event.args.retiringEntity,
    retiringReason: event.args.retiringReason,
  });
});
