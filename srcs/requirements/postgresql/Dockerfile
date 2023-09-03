FROM debian:bullseye

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y dumb-init postgresql-13 vim

COPY ./tools/database.sh ./tmp
COPY ./config/pg_hba.conf ./etc/postgresql/13/main/pg_hba.conf
COPY ./config/postgresql.conf ./etc/postgresql/13/main/postgresql.conf

WORKDIR /tmp

RUN chmod +x ./database.sh

EXPOSE 5432

CMD ["./database.sh"]