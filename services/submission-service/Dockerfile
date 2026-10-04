FROM node:20-alpine
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /app/uploads
EXPOSE 3003
CMD ["npm","start"]
