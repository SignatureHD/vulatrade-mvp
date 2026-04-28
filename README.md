# VulaTrade MVP

**VulaTrade — Start local. Sell smarter. Grow stronger.**

VulaTrade is a simple business operating system for local entrepreneurs. It helps users choose a starter business setup, edit their details, list products/services, use WhatsApp selling messages, and track customers through a small sales pipeline.

## Current MVP features

- Landing page
- Starter Setups / business snapshots
- Dashboard
- Business setup
- Theme and background style selector
- Product/service setup
- Business page preview
- Customer tracker
- Drag-and-drop pipeline movement
- WhatsApp message templates
- Growth tools
- Learn / Get Paid toolkit

## Supabase-ready files added

The repo now includes the first Supabase setup layer:

- `@supabase/supabase-js` dependency
- `.env.example`
- `src/lib/supabase.js`
- `supabase/schema.sql`

## Run locally

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Open Supabase SQL Editor.
3. Copy and run the SQL in `supabase/schema.sql`.
4. Go to Project Settings → API.
5. Copy:
   - Project URL
   - anon public key
6. Add these to your local `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Railway environment variables

In Railway, add these variables to the `vulatrade-mvp` service:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then redeploy.

## Next build phase

The next phase is wiring the app UI to Supabase:

- Add sign-up / login
- Save business profile
- Save products/services
- Save customers
- Save theme/background settings
- Create public `/b/:slug` business pages
- Persist drag-and-drop customer status changes
