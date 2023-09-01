IMAGE_NAME = postgresql

all:	build run

image:
	@sudo docker pull debian:bullseye

build:
	@sudo docker build -t $(IMAGE_NAME) .

run:
	@sudo docker run -it -p 5432:5432 --name $(IMAGE_NAME) $(IMAGE_NAME)

# re:	clean all

clean:
	@sudo docker rmi $(IMAGE_NAME)