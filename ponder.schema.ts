import { index, onchainTable } from "ponder";

export const carbonSwap = onchainTable(
  "carbon_swap",
  (t) => ({
    id: t.text().primaryKey(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    carbonClass: t.hex().notNull(),
    credit: t.hex().notNull(),
    quoter: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    tonnageAmount: t.bigint().notNull(),
    kvcmAmount: t.bigint().notNull(),
    recipient: t.hex().notNull(),
  }),
  (table) => ({
    creditIdx: index().on(table.credit),
    recipientIdx: index().on(table.recipient),
  }),
);

export const retirement = onchainTable(
  "retirement",
  (t) => ({
    id: t.text().primaryKey(),
    blockNumber: t.bigint().notNull(),
    timestamp: t.bigint().notNull(),
    carbonClass: t.hex().notNull(),
    credit: t.hex().notNull(),
    quoter: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    tonnageAmount: t.bigint().notNull(),
    retiringEntity: t.hex().notNull(),
    retiringReason: t.text().notNull(),
  }),
  (table) => ({
    creditIdx: index().on(table.credit),
    retiringEntityIdx: index().on(table.retiringEntity),
  }),
);
