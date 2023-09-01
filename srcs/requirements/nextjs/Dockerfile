FROM debian:bullseye
 
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y build-essential curl vim && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

COPY frontend_server /app/frontend_server

WORKDIR /app/frontend_server

RUN npm install -g npm@7   # npm 버전 7로 업그레이드

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]