# Use an official PostgreSQL runtime as a parent image
FROM postgres:13

# Set the environment variable for PostgreSQL password
ENV POSTGRES_PASSWORD ${RDS_PASSWORD}

# Create a new database
ENV POSTGRES_DB {RDS_DB_NAME}

# Expose the PostgreSQL port (5432 is the default)
EXPOSE 5432
