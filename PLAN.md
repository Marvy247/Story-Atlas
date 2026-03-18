# Story Atlas — Mainnet Production Plan

## 1. Chain & Network Config
- [ ] Add Story mainnet chain definition (chain ID 1514) to `client.ts`
- [ ] Replace Odyssey testnet with mainnet as default chain
- [ ] Update `config/index.tsx` to use Story mainnet instead of Base/BaseSepolia
- [ ] Fix `context/index.tsx` metadata (remove "Base Lending Pool" copy-paste)

## 2. Environment Variables
- [ ] Create `.env.local.example` with all required vars
- [ ] Set `NEXT_PUBLIC_USE_MOCK_DATA=false` as default in example
- [ ] Document each variable with inline comments

## 3. Real API Validation
- [ ] Verify field mappings against live Story API v4 response shape
- [ ] Fix `parents`/`children` mapping (`ancestorIpIds` vs `parentIpIds`)
- [ ] Verify or remove `fetchIPRelationships` (`/assets/{id}/relationships` endpoint)
- [ ] Test `searchIPAssets` against real API

## 4. Remove Mock Data Fallback in Production
- [ ] Remove silent fallback to mock data on API error in `fetchIPAssets`
- [ ] Remove silent fallback to mock data on API error in `searchIPAssets`
- [ ] Surface real errors to the UI instead of silently swallowing them

## 5. Fix Wallet / AppKit Context
- [ ] Decide: read-only app (remove wallet connect) or keep it
- [ ] If keeping: wire `ContextProvider` into `layout.tsx` with correct Story network
- [ ] If removing: delete `context/index.tsx` and `config/index.tsx`, remove unused deps

## 6. Performance — Pagination
- [ ] Cap initial graph load (e.g. 200 nodes) with a "Load More" button
- [ ] Deduplicate `useIPAssets({ limit: 1000 })` calls between main page and analytics (shared SWR key)
- [ ] Move `fetchIPStats` aggregation to avoid re-fetching assets already in cache

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
