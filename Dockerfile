FROM alvrme/alpine-android:android-29-jdk11 AS android-build

WORKDIR /app

RUN wget -O apktool.jar https://github.com/iBotPeaches/Apktool/releases/download/v2.9.2/apktool_2.9.2.jar

COPY ./AhMyth-Client/ .

RUN chmod a+x ./gradlew && ./gradlew assembleRelease

# Decompile the APK
RUN java -jar apktool.jar d ./app/build/outputs/apk/release/app-release-unsigned.apk -o ./app-release

FROM alvrme/alpine-android:android-29-jdk11 AS server-base

RUN apk add --no-cache nodejs yarn

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
COPY --from=android-build /app/app-release ./extracted_apk

CMD ["node", "index.js"]
