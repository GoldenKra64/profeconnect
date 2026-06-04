# Módulo de IA + MCP (rama `fix/modelo-de-IA`)

## Problemas corregidos respecto al intento anterior

| Problema | Solución |
|----------|----------|
| Build Railway P1012 (`url` faltante en Prisma) | **No se modifica** `datasource db` en `schema.prisma`; se mantiene `url = env("DIRECT_URL")`. |
| Variables nuevas sin acuerdo (`MCP_DEV_*`, `MCP_MODE`, etc.) | Solo se usa **`CHATBOT_API_KEY`** (ya existente). MCP embebido en el API. |
| Chatbot sin acceso al foro | Toggle en UI + `useForumTools` + JWT en socket. |
| Socket apuntando a `localhost` en producción | `VITE_SOCKET_URL` en build de Render + fallback `window.location.origin`. |
| Push directo a `main` | Cambios en rama **`fix/modelo-de-IA`** para revisión en PR. |

## Variables de entorno

**Backend (Railway / Render):** sin variables nuevas obligatorias.

- `CHATBOT_API_KEY` — DeepSeek (requerida para IA)
- `DIRECT_URL` / `DATABASE_URL` — sin cambios
- `JWT_SECRET`, `FRONTEND_URL` — sin cambios

**Build frontend en Render** (añadidas en `render.yaml`):

- `VITE_API_URL` → URL del API Railway
- `VITE_SOCKET_URL` → misma base para Socket.IO

## Endpoints

- `POST /api/v1/ai/classify` — clasificación de publicaciones (docente/admin)
- Socket `/chatbot` — `useForumTools: true` para consultar posts vía MCP

## Verificación antes de merge

```bash
cd backend
npm run verify:prisma
npm run test:mcp
```
