FROM debian:bullseye

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y && \
    apt-get install -y dumb-init && \
    apt install -y postgresql-13 vim

COPY . .

RUN chmod +x ./database.sh

EXPOSE 5432

# ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/database.sh"]