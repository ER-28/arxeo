# Arxeo — Feature Roadmap

## Current Status

### Backend (COMPLETE — 52 API endpoints, port 4000)
- Auth (JWT + refresh tokens, register, login, password reset, email verify, OAuth)
- 2-level RBAC (instance: superadmin/user, org: owner/admin/member/viewer)
- PBAC with 20 permissions
- Organization CRUD + member management + invite tokens
- Vault + Vault item CRUD with soft-delete + version history
- 2FA/TOTP (setup, enable, disable, verify)
- File attachments (MinIO integration)
- Audit logging (login history, vault access, CRUD changes)
- Password generator
- Vault sharing (dedicated share/unshare/sharees endpoints)
- Redis cache decorators (@CacheTTL)
- BullMQ email queue (background email sending)
- OAuth/Google login
- API key authentication
- GDPR data export/delete
- Teams/groups within organizations
- Vault item history/versions
- Breach monitoring (Have I Been Pwned k-anonymity)
- Import/export (Bitwarden CSV + JSON)
- Search engine (global + per-vault regex search)
- Health check endpoints (/health, /health/live, /health/ready)
- Swagger docs, helmet, CORS, throttler, validation

### Infrastructure
- Docker Compose: MongoDB 7, Redis 7, Mailpit, MinIO
- Landing page (port 3000) — fully built

---

## Frontend Implementation (IN PROGRESS — app frontend, port 3001)

**Stack:** Next.js 16 (App Router) + shadcn/ui + TanStack Query + Zustand + Tailwind v4

### F01 — Project Setup + shadcn/ui (~15 files)
- [ ] Wipe boilerplate, install deps (lucide-react, zustand, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, next-themes)
- [ ] Initialize shadcn/ui + add components (button, input, form, card, dialog, tabs, table, dropdown-menu, select, switch, textarea, separator, sonner, skeleton, alert, alert-dialog, avatar, badge, checkbox, popover, tooltip, scroll-area, progress, sidebar, command)
- [ ] Configure `next.config.ts` — API proxy rewrite (`/v1/:path*` → `http://localhost:4000/v1/:path*`)
- [ ] Set up `globals.css` — shadcn/ui theme with violet/cyan brand colors, dark mode
- [ ] Root `layout.tsx` — Geist fonts + ThemeProvider + QueryClientProvider + Toaster
- [ ] `lib/api.ts` — Fetch wrapper with `/v1` prefix, Bearer token, auto-refresh on 401
- [ ] `stores/auth-store.ts` — Zustand: user, tokens, login/logout, localStorage persistence
- [ ] `stores/app-store.ts` — Zustand: selectedOrgId, selectedVaultId, sidebarOpen
- [ ] `types/index.ts` — TypeScript interfaces for all API response shapes
- [ ] `lib/constants.ts` — API base URL, role labels, permission labels

### F02 — Auth Pages (~6 files)
- [ ] `/login` — Email/password form + Google OAuth button + "Forgot password?" link
- [ ] `/register` — Email, username, password, confirm password, first/last name
- [ ] `/forgot-password` — Email input, sends reset link via `POST /auth/forgot-password`
- [ ] `/reset-password` — Token from URL query + new password + confirm
- [ ] `/auth/callback` — OAuth callback: extracts accessToken/refreshToken from URL params
- [ ] `auth-guard.tsx` — Client wrapper, redirects to `/login` if unauthenticated

### F03 — Dashboard Layout + Org/Vault Overview (~8 files)
- [ ] `(dashboard)/layout.tsx` — Sidebar + topbar shell, auth-guarded
- [ ] `sidebar.tsx` — Org switcher, vault tree nav, settings link, user menu
- [ ] `topbar.tsx` — Global search (Cmd+K), user avatar dropdown
- [ ] `/dashboard` — Org cards grid, "Create Organization" button + dialog
- [ ] `/orgs/[orgId]` — Org detail page with tabs: Vaults | Members | Teams | Settings
- [ ] `org-switcher.tsx` — Dropdown org selector component
- [ ] `team-card.tsx` — Team summary card for org teams tab
- [ ] Members tab with role badges, invite/remove actions

### F04 — Vault + Items CRUD (~8 files)
- [ ] `/orgs/[orgId]/vaults/[vaultId]` — Vault items page
- [ ] `vault-items-table.tsx` — Data table: title, username, URL, tags, favorite, actions
- [ ] `item-dialog.tsx` — Add/edit vault item dialog (react-hook-form + Zod)
- [ ] `password-field.tsx` — Password input with show/house toggle + copy button
- [ ] `password-generator.tsx` — Inline generator popover (length, chars, entropy display)
- [ ] `attachment-upload.tsx` — File upload to vault items
- [ ] `share-dialog.tsx` — Share vault with users dialog
- [ ] Item version history view (`GET /items/:itemId/history`)

### F05 — Settings Pages (~5 files)
- [ ] `/settings` — Profile: edit first/last name, email → `PATCH /auth/profile`
- [ ] `/settings/security` — Change password → `POST /auth/change-password`
- [ ] `/settings/security` — 2FA setup: QR code from `POST /2fa/setup`, verify → `POST /2fa/enable`
- [ ] `/settings/security` — API keys: list, create (show key once), revoke
- [ ] `/settings/gdpr` — Export data → `GET /auth/export-data`, delete account → `POST /auth/delete-account`

### F06 — Search + Import/Export (~3 files)
- [ ] Command palette (Cmd+K) — Global search via `GET /search?q=...`
- [ ] Import Bitwarden CSV → `POST /vaults/:vaultId/import/bitwarden`
- [ ] Export as Bitwarden CSV or JSON

### F07 — Audit Log + Polish (~3 files)
- [ ] Audit log table — Paginated, user + org activity views
- [ ] Loading skeletons, error states, empty states for all pages
- [ ] Responsive design: mobile sidebar overlay, table horizontal scroll
- [ ] Keyboard shortcuts (Cmd+K search, Cmd+N new item)

---

## Implementation Order

| Phase | Files | Status |
|-------|-------|--------|
| F01 — Setup + shadcn/ui + API client + stores | ~15 | **NEXT** |
| F02 — Auth pages | ~6 | Pending |
| F03 — Dashboard layout + orgs | ~8 | Pending |
| F04 — Vault CRUD + sharing | ~8 | Pending |
| F05 — Settings (profile, 2FA, GDPR) | ~5 | Pending |
| F06 — Search + import/export | ~3 | Pending |
| F07 — Audit + polish | ~3 | Pending |
| **Total** | **~48** | |
