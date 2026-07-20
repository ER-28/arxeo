# Arxeo Backend - Feature Roadmap

## Current Status
- Auth (JWT + refresh tokens, register, login, password reset, email verify)
- 2-level RBAC (instance: superadmin/user, org: owner/admin/member/viewer)
- PBAC with 20 permissions
- Organization CRUD + member management
- Vault + Vault item CRUD with soft-delete
- Swagger docs, helmet, CORS, throttler, validation
- MinIO connected, Mailpit connected, MongoDB + Redis connected

---

## Dead Services (Connected But Unused)

- [ ] MinIO — service works, zero endpoints call it
- [ ] Redis cache — CacheModule connected but no @CacheTTL or manual cache calls
- [ ] BullMQ — configured, zero queues/processors
- [ ] MailService.sendInvite() — implemented, never called
- [ ] MongoDB text index on VaultItem — defined but queries use $regex
- [ ] VaultItem customFields — in schema, missing from DTOs

---

## High Priority (P0)

- [ ] **F01** — Health check endpoint (`/v1/health`)
- [ ] **F02** — Wire sendInvite email from OrganizationsService
- [ ] **F03** — Self-service profile update (name, email, password change)
- [ ] **F04** — File attachments on vault items (MinIO integration)
- [ ] **F05** — 2FA/TOTP support (setup, verify, backup codes)
- [ ] **F06** — Audit log (login history, vault access, CRUD changes)

## Medium Priority (P1)

- [ ] **F07** — Password generator endpoint
- [ ] **F08** — Vault sharing endpoints (dedicated share/unshare)
- [ ] **F09** — Invite flow with tokens (pending invites, accept/decline)
- [ ] **F10** — Wire Redis cache decorators (@CacheTTL, @CacheInterceptor)
- [ ] **F11** — Wire BullMQ email queue (background email sending)
- [ ] **F12** — Fix VaultItem text index + add custom fields to DTOs
- [ ] **F13** — OAuth/Social login (Google, GitHub)

## Low Priority (P2)

- [ ] **F14** — API key authentication (programmatic access)
- [ ] **F15** — GDPR data export/delete
- [ ] **F16** — Teams/groups within organizations
- [ ] **F17** — Vault history/versions
- [ ] **F18** — Breach monitoring (Have I Been Pwned integration)
- [ ] **F19** — Import/export from other password managers (Bitwarden, 1Password CSV)
- [ ] **F20** — Search engine integration (Meilisearch/Elasticsearch)
