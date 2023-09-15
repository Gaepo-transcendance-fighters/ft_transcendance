NAME = Transcendance

RED			=	\033[0;31m
GRN			= 	\033[0;32m
YLW			=	\033[0;33m
BLU			= 	\033[0;36m
DFT			= 	\033[0;37m

# all: fclean up

up: clone
	@docker-compose -f ./srcs/docker-compose.yml up --build -d;
	@echo "$(GRN)>>> docker compose up$(DFT)"

down: rm
	@docker-compose -f ./srcs/docker-compose.yml down;
	@echo "$(YLW)>>> docker compose down$(DFT)"

image:
	@docker pull node:lts
	@echo "$(GRN)>>> docker image download$(DFT)"

clone:
	@git clone https://github.com/Gaepo-transcendance-fighters/BACK-END.git ./srcs/requirements/nestjs/backend_server 2> /dev/null || true
	@git clone https://github.com/Gaepo-transcendance-fighters/FRONT-END.git ./srcs/requirements/nextjs/frontend 2> /dev/null || true
	cp ./srcs/.env ./srcs/requirements/nestjs/backend_server/backend_server
	cp ./srcs/.env ./srcs/requirements/nextjs/frontend/frontend


rm:
	@docker-compose -f ./srcs/docker-compose.yml down --volumes --remove-orphans
	@sudo rm -rf ./srcs/requirements/nestjs/backend_server
	@sudo rm -rf ./srcs/requirements/nextjs/frontend

clean: down
	@docker system prune -af
	@echo "$(RED)>>> docker stop and remove networks and caches$(DFT)"

.PHONY: up down clean