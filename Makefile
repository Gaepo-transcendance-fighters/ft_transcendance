NAME = Transcendance

RED			=	\033[0;31m
GRN			= 	\033[0;32m
YLW			=	\033[0;33m
BLU			= 	\033[0;36m
DFT			= 	\033[0;37m

# all: fclean up

up: clone
	@docker-compose -f ./docker-compose.yml up --build -d;
	@echo "$(GRN)>>> docker compose up$(DFT)"

down: rm
	@docker-compose -f ./docker-compose.yml down;
	@echo "$(YLW)>>> docker compose down$(DFT)"

image:
	@docker pull node:lts
	@echo "$(GRN)>>> docker image download$(DFT)"

clone:
	cp ./.env ./srcs/requirements/nestjs/backend_server/backend_server
	cp ./.env ./srcs/requirements/nextjs/frontend/frontend


rm:
	@docker-compose -f ./docker-compose.yml down --volumes --remove-orphans

clean: down
	@docker system prune -af
	@echo "$(RED)>>> docker stop and remove networks and caches$(DFT)"

.PHONY: up down clean