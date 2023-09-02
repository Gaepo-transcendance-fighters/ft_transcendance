#!/bin/bash

# Postgresql 시작
service postgresql start

# 데이터베이스 사용자 비밀번호 및 권한 설정
su - postgres -c "psql -c \"alter user postgres with password 'postgres';\""
su - postgres -c "psql -c \"CREATE DATABASE pingpong WITH OWNER postgres;\""

# 데이터베이스 생성
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pingpong TO postgres;\""

service postgresql restart

tail -f /dev/null
