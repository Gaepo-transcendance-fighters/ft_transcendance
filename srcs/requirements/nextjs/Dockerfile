FROM debian:bullseye

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y && \
    apt-get install -y build-essential && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt install -y vim && \
    apt-get install -y nodejs && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
    npm install -g n && \
    n latest

COPY frontend_server /app/frontend_server

WORKDIR /app/frontend_server

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
