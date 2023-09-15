# Node.js LTS 버전을 기반으로 이미지를 생성합니다.
FROM node:lts

COPY backend_server/backend_server /app/backend_server

WORKDIR /app/backend_server

# # 작업 디렉토리를 설정합니다.
# WORKDIR /app

# 애플리케이션 의존성을 설치합니다.
RUN npm install

EXPOSE 4000

# 컨테이너를 시작할 때 실행할 명령을 지정합니다.
CMD [ "npm", "run", "start:dev" ]

# # Node.js LTS 버전을 기반으로 이미지를 생성합니다.
# FROM node:lts

# # 작업 디렉토리를 설정합니다.
# WORKDIR /app

# # 애플리케이션 의존성 파일(package.json 및 package-lock.json)을 복사합니다.
# COPY ./backend_server/backend_server/package*.json ./

# # 애플리케이션 의존성을 설치합니다.
# RUN npm install

# # 애플리케이션 소스 코드를 복사합니다. (현재 디렉토리의 모든 파일을 복사합니다.)
# COPY . .

# # NestJS 애플리케이션을 빌드합니다.
# RUN npm run build

# # 컨테이너를 시작할 때 실행할 명령을 지정합니다.
# CMD [ "npm", "run", "start:dev" ]

