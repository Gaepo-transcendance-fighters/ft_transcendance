FROM debian:bullseye

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y && \
    apt-get install -y curl && \
    apt install -y vim && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt install sudo && \
    apt-get install -y nodejs && \
    apt install -y telnet && \
    apt install -y ufw

COPY backend_server /app/backend_server

WORKDIR /app/backend_server

RUN npm i --save @nestjs/websockets @nestjs/platform-socket.io && \
    npm install

EXPOSE 4000

CMD [ "npm", "run", "start:dev" ]
