IMAGE_NAME = nestjs

all:	build run

image:
	@sudo docker pull debian:bullseye

build:
	@sudo docker build -t $(IMAGE_NAME) .

run:
	@sudo docker run -it -p 4000:4000 --name $(IMAGE_NAME) $(IMAGE_NAME)

# re:	clean all

clean:
	@sudo docker rmi $(IMAGE_NAME)