# Node.js LTS 버전을 기반으로 이미지를 생성합니다.
FROM node:lts

# 애플리케이션 의존성 파일(package.json 및 package-lock.json)을 복사합니다.
COPY ./frontend/frontend app/frontend

# 작업 디렉토리를 설정합니다.
WORKDIR /app/frontend


# 애플리케이션 의존성을 설치합니다.
RUN npm install

# 애플리케이션 소스 코드를 복사합니다. (현재 디렉토리의 모든 파일을 복사합니다.)
EXPOSE 3000

# 컨테이너를 시작할 때 실행할 명령을 지정합니다.
CMD [ "npm", "run", "dev" ]

# FROM debian:bullseye

# RUN apt-get update && apt-get upgrade -y && \
#     apt-get install -y build-essential curl vim && \
#     curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
#     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && \
#     apt-get install -y nodejs && \
#     npm install -g n && n latest

# COPY frontend/frontend /app/frontend_server
# COPY .env /app/frontend_server

# WORKDIR /app/frontend_server

# RUN npm install

# EXPOSE 3000

# CMD [ "npm", "run", "dev" ]
