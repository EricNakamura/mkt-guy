FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY src ./src
COPY scripts ./scripts
COPY assets ./assets
COPY demo ./demo

RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 4321

CMD ["node", "src/server.js"]
