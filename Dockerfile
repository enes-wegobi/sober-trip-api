# Build stage
FROM node:23-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=development && \
    npm cache clean --force

COPY . .

RUN npm run build

FROM node:23-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

RUN addgroup -S nodejs && \
    adduser -S nestjs -G nodejs && \
    chown -R nestjs:nodejs /usr/src/app

USER nestjs

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
