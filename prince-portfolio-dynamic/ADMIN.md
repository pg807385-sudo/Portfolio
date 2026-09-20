# Admin dashboard

The React app includes an `/admin` API backend, but the public UI is intentionally kept separate from the main portfolio.

To add a proper admin screen, create a React route/component that calls:
- POST /api/admin/login
- GET /api/admin/projects
- POST /api/admin/projects
- DELETE /api/admin/projects/:id
- POST /api/admin/skills
- DELETE /api/admin/skills/:id
- GET /api/admin/messages
- PUT /api/admin/messages/:id/read
- POST /api/admin/logout

The API is already protected by an HttpOnly signed session cookie.

For a production deployment, also add rate limiting/WAF rules at Cloudflare and keep ADMIN_PASSWORD and SESSION_SECRET as Wrangler secrets.
