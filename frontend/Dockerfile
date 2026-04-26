# ============================================================
#  Energy Pulse — Frontend (multi-stage build)
#
#  Stages:
#    deps       → dependências instaladas (cache layer)
#    build      → artefactos de produção compilados
#    dev        → hot-reload em desenvolvimento
#    production → nginx servindo estáticos em produção
# ============================================================

# ---------- DEPS ----------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ---------- BUILD ----------
FROM deps AS build

COPY . .
RUN npm run build

# ---------- DEV ----------
FROM node:20-alpine AS dev

WORKDIR /app

# Copiar node_modules da stage deps para cachear
COPY --from=deps /app/node_modules ./node_modules

# Copiar apenas os ficheiros necessários em dev
# (o resto é montado via volume no docker-compose)
COPY package.json vite.config.js ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- PRODUCTION ----------
FROM nginx:1.27-alpine AS production

# Segurança: utilizador não-root
RUN adduser -D -u 1001 appuser

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN mkdir -p /app/staticfiles \
    && chown -R appuser:appuser /usr/share/nginx/html /var/cache/nginx /var/run /app

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
