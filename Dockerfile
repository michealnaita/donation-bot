FROM node:16.16.0-alpine3.16 as build
WORKDIR /app
COPY ./app/package*.json ./
RUN npm install
RUN npm install --location=global typescript
COPY ./app ./
RUN npm run build

FROM node:16.16.0-alpine3.16
RUN apk add dumb-init
WORKDIR /app
COPY ./app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/bin ./
USER node
ENV NODE_ENV production
CMD ["dumb-init","node","app.js"]