FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY code/frontend/package*.json ./
RUN npm ci
COPY code/frontend ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app/backend
COPY code/backend/package*.json ./
RUN npm ci --omit=dev
COPY code/backend ./
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
RUN mkdir -p /app/backend/data

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
