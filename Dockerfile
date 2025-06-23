FROM node:24.2.0-slim
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD [ "node", "app.js" ]
