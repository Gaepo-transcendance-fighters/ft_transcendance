# Use an official PostgreSQL runtime as a parent image
FROM postgres:13

# Set the environment variable for PostgreSQL password
ENV POSTGRES_PASSWORD ${RDS_PASSWORD}

# Create a new database
ENV POSTGRES_DB ${RDS_DB_NAME}

COPY ./tools/database.sh ./tmp/database.sh
COPY ./config/pg_hba.conf ./etc/postgresql/13/main/pg_hba.conf
COPY ./config/postgresql.conf ./etc/postgresql/13/main/postgresql.conf

WORKDIR /tmp

RUN chmod +x ./database.sh

ENTRYPOINT [ "./database.sh" ]

# Expose the PostgreSQL port (5432 is the default)
EXPOSE 5432
