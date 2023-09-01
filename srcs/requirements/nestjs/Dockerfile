FROM debian:bullseye

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    apt install -y vim

COPY backend_server /app/backend_server

WORKDIR /app/backend_server

RUN npm i --save @nestjs/websockets @nestjs/platform-socket.io && \
    npm install

EXPOSE 4000

CMD [ "npm", "run", "start:dev" ]
