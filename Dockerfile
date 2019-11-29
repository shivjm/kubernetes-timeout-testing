FROM shivjm/node-chromium-alpine:13

WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY --chown=node package.json package-lock.json ./

RUN npm ci --quiet

COPY --chown=node index.js index.js

USER node

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV IN_DOCKER=1

ENTRYPOINT ["npm", "start"]
