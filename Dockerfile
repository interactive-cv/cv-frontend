# Multi-stage: deps + build (Turbopack) → минимальный рантайм (standalone).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* — публичные переменные клиента, инлайнятся в бандл при next build.
ARG NEXT_PUBLIC_API_URL=https://cv.example.com
ARG NEXT_PUBLIC_SITE_URL=https://cv.example.com
ARG NEXT_PUBLIC_OWNER_NAME=Имя Фамилия
ARG NEXT_PUBLIC_OWNER_ROLE=Fullstack
ARG NEXT_PUBLIC_OWNER_TAGS=Fullstack, Next.js, FastAPI
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_OWNER_NAME=$NEXT_PUBLIC_OWNER_NAME
ENV NEXT_PUBLIC_OWNER_ROLE=$NEXT_PUBLIC_OWNER_ROLE
ENV NEXT_PUBLIC_OWNER_TAGS=$NEXT_PUBLIC_OWNER_TAGS
RUN npm run build

# Рантайм: только standalone output (минимальный, без node_modules полностью).
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# app/icon.png — favicon (Next.js metadata file). Standalone не копирует его автоматически.
COPY --from=builder /app/app/icon.png ./app/icon.png
EXPOSE 3000
CMD ["node", "server.js"]
