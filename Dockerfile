FROM node:18-alpine AS server-base

WORKDIR /app

FROM server-base AS server-build

COPY ./AhMyth-Server/package.json ./AhMyth-Server/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./AhMyth-Server/ .

RUN yarn build

FROM server-base AS server-prod

COPY ./AhMyth-Server/package.json ./AhMyth-Server/yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=server-build /app/dist ./

CMD ["node", "index.js"]
