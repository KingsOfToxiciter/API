FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    fontconfig \
    udev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]