# klima-v2-analysis

Index CarbonSwap and CarbonRetiredViaRA events from the Klima Protocol AssetManager diamond (`0x1C24...fbde1`) on Base. Outputs CSV files.

## Setup

```
npm install
echo 'BASE_RPC_URL=https://...' > .env
```

## Usage

```
npm run index
```

Writes `data/swaps.csv` and `data/retirements.csv`. Tracks progress in `data/cursor.json` — subsequent runs only fetch new blocks.

## Tests

```
npm test
```
