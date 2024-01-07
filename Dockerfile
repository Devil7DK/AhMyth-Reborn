FROM alvrme/alpine-android:android-30-jdk11 AS android-build

WORKDIR /app

RUN wget -O apktool.jar https://github.com/iBotPeaches/Apktool/releases/download/v2.9.2/apktool_2.9.2.jar

COPY ./AhMyth-Client/ .

RUN chmod a+x ./gradlew && ./gradlew assembleDebug

# Decompile the APK
RUN java -jar apktool.jar d ./app/build/outputs/apk/debug/app-debug.apk -o ./app-debug

RUN ls -la ./app-debug

FROM node:18-alpine AS server-base

WORKDIR /app

FROM server-base AS server-build

COPY ./AhMyth-Server/package.json ./AhMyth-Server/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./AhMyth-Server/ .

RUN yarn build

FROM server-base AS server-prod

RUN apk add --no-cache openjdk11

COPY ./AhMyth-Server/package.json ./AhMyth-Server/yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=server-build /app/dist ./
COPY --from=android-build /app/app-debug ./extracted_apk

CMD ["node", "index.js"]
