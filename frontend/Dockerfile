FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install vite @vitejs/plugin-react --save-dev
COPY . .
EXPOSE 5173
CMD ["node", "node_modules/vite/bin/vite.js", "--host"]
