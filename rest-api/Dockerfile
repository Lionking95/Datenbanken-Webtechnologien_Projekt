FROM node:20

WORKDIR /app

# MySQL client für mysqladmin (ping)
RUN apt-get update \
  && apt-get install -y default-mysql-client \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Start: warte bis DB erreichbar ist, dann starte deine App
ENTRYPOINT ["sh", "-c", "until mysqladmin ping -h$DB_HOST -P$DB_PORT --silent; do echo 'waiting for db...'; sleep 2; done; npm run run:prod"]
