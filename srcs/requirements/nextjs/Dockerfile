FROM debian:bullseye

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y build-essential curl vim && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
    apt-get install -y nodejs && \
    npm install -g n && n latest

COPY frontend_server /app/frontend_server

WORKDIR /app/frontend_server

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
