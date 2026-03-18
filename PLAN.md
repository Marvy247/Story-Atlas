# Story Atlas — Mainnet Production Plan

## 1. Chain & Network Config
- [x] Add Story mainnet chain definition (chain ID 1514) to `client.ts`
- [x] Replace Odyssey testnet with mainnet as default chain
- [x] Update `config/index.tsx` to use Story mainnet instead of Base/BaseSepolia
- [x] Fix `context/index.tsx` metadata (remove "Base Lending Pool" copy-paste)

## 2. Environment Variables
- [x] Create `.env.local.example` with all required vars
- [x] Set `NEXT_PUBLIC_USE_MOCK_DATA=false` as default in example
- [x] Document each variable with inline comments

## 3. Real API Validation
- [x] Verify field mappings against live Story API v4 response shape
- [x] Fix `parents`/`children` mapping (`ancestorIpIds` vs `parentIpIds`)
- [x] Verify or remove `fetchIPRelationships` (`/assets/{id}/relationships` endpoint)
- [x] Test `searchIPAssets` against real API

## 4. Remove Mock Data Fallback in Production
- [x] Remove silent fallback to mock data on API error in `fetchIPAssets`
- [x] Remove silent fallback to mock data on API error in `searchIPAssets`
- [x] Surface real errors to the UI instead of silently swallowing them

## 5. Fix Wallet / AppKit Context
- [x] Decide: read-only app (remove wallet connect) or keep it
- [x] If keeping: wire `ContextProvider` into `layout.tsx` with correct Story network
- [x] If removing: delete `context/index.tsx` and `config/index.tsx`, remove unused deps

## 6. Performance — Pagination
- [x] Cap initial graph load (e.g. 200 nodes) with a "Load More" button
- [x] Deduplicate `useIPAssets({ limit: 1000 })` calls between main page and analytics (shared SWR key)
- [x] Move `fetchIPStats` aggregation to avoid re-fetching assets already in cache

## 7. Build & Type Check
- [ ] Run `npx tsc --noEmit` and fix all type errors
- [ ] Run `npm run build` and fix all build errors
- [ ] Run `npm run lint` and fix lint warnings

## 8. SEO & Metadata
- [ ] Add OpenGraph tags to `layout.tsx`
- [ ] Add Twitter card meta tags
- [ ] Set canonical URL via env var

## 9. Deployment
- [ ] Add `NEXT_PUBLIC_*` vars to hosting environment (Vercel / etc.)
- [ ] Confirm `npm run build && npm run start` works end-to-end against mainnet
- [ ] Update README with correct mainnet URLs and setup instructions
