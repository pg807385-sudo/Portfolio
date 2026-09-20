# Prince Web Devs — Dynamic React + Cloudflare Workers + D1

Complete portfolio starter with:
- React + Vite frontend
- Cloudflare Worker API
- Cloudflare D1 database
- Projects loaded dynamically from D1
- Skills loaded dynamically from D1
- Contact form storing messages in D1
- Admin authentication API
- Project/skill/message management API
- Single-page application routing through Workers Assets

## Local setup

1. Install Node.js 20+.
2. Install packages:
   npm install
3. Create a D1 database:
   npx wrangler d1 create prince_portfolio
4. Copy the returned database ID into wrangler.toml.
5. Apply the schema locally:
   npx wrangler d1 migrations apply prince_portfolio --local
6. Run:
   npm run dev

For local API development through Vite, use Wrangler Pages/Workers preview:
   npm run build
   npx wrangler dev

## Production setup

1. Create D1:
   npx wrangler d1 create prince_portfolio

2. Put its database ID in wrangler.toml.

3. Set secrets:
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET

   Use a long random SESSION_SECRET.

4. Change ADMIN_EMAIL in wrangler.toml.

5. Apply migrations:
   npx wrangler d1 migrations apply prince_portfolio --remote

6. Deploy:
   npm run deploy

Your Worker will serve the React build and the /api/* endpoints.

## Custom domain

In Cloudflare, attach your domain/subdomain to the Worker after deployment. For:
portfolio.princewebdevs.workers.dev
the exact workers.dev hostname is controlled by your Cloudflare account; use your actual Worker hostname.

## Important

Do not put ADMIN_PASSWORD or SESSION_SECRET in frontend code or GitHub.

The starter intentionally does not include a default admin password.
