#!/bin/bash
echo "Postgresql installing ready."
# Postgresql 시작
service postgresql start

# 데이터베이스 사용자 비밀번호 및 권한 설정
su - postgres -c "psql -c \"alter user postgres with password 'postgres';\""
su - postgres -c "psql -c \"CREATE DATABASE pingpong8 WITH OWNER postgres;\""

# 데이터베이스 생성
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pingpong8 TO postgres;\""

#!/bin/bash

# PostgreSQL 호스트 및 포트 설정
HOST=$RDS_HOSTNAME
PORT="5432"

# PostgreSQL 관리자 계정
DB_USER=$RDS_USERNAME

# 생성할 데이터베이스 이름
DB_NAME=$RDS_DB_NAME

# 데이터베이스 생성 명령어 실행
echo "Database $DB_NAME creating ready."
echo "$HOST , $PORT , $DB_USER , $DB_NAME"
createdb -h localhost -p 5432 -U postgres pingpong8

# 생성된 데이터베이스 확인
echo "Database $DB_NAME has been created."


service postgresql restart

tail -f /dev/null


# #!/bin/bash
# echo "Postgresql installing ready."
# # # Postgresql 시작
# # service postgresql start
# # PostgreSQL 데이터 디렉토리 확인
# ls -la /var/lib/postgresql/13/main

# # 데이터 디렉토리가 없으면 생성
# sudo mkdir -p /var/lib/postgresql/13/main

# # 디렉토리 소유자를 postgres로 변경
# sudo chown -R postgres:postgres /var/lib/postgresql/13/main

# # 디렉토리 권한 설정 (일반적으로 700)
# sudo chmod 700 /var/lib/postgresql/13/main

# # 데이터베이스 사용자 비밀번호 및 권한 설정
# su - postgres -c "psql -c \"alter user postgres with password 'postgres';\""
# su - postgres -c "psql -c \"CREATE DATABASE pingpong WITH OWNER postgres;\""

# # 데이터베이스 생성
# su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pingpong8 TO postgres;\""

# #!/bin/bash

# # PostgreSQL 호스트 및 포트 설정
# HOST=$RDS_HOSTNAME
# PORT="5432"

# # PostgreSQL 관리자 계정
# DB_USER=$RDS_USERNAME

# # 생성할 데이터베이스 이름
# DB_NAME=$RDS_DB_NAME

# # 데이터베이스 생성 명령어 실행
# echo "Database '$DB_NAME' creating ready."
# createdb -h $HOST -p $PORT -U $DB_USER $DB_NAME

# # 생성된 데이터베이스 확인
# echo "Database '$DB_NAME' has been created."


# service postgresql restart

# tail -f /dev/null
