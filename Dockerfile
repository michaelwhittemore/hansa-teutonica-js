FROM node:24.2.0-slim
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
ENV PORT=80 IS_DOCKER=true
COPY . .
CMD [ "node", "src/app.js" ]
