# NAME = Transcendance

# # VOLUME_PATH :=  /home/jaekim/data
# RED			=	\033[0;31m
# GRN			= 	\033[0;32m
# YLW			=	\033[0;33m
# BLU			= 	\033[0;36m
# DFT			= 	\033[0;37m

# all: fclean up

# up:
# #	@mkdir -p $(VOLUME_PATH)/wordpress
# #	@mkdir -p $(VOLUME_PATH)/mariadb
# #	@sudo chmod 647 /etc/hosts
# #	@echo "127.0.0.1	jaekim.42.fr" > /etc/hosts
# #	@sudo chmod 644 /etc/hosts
# 	@sudo docker-compose -f ./srcs/docker-compose.yml up --build -d;
# 	@echo "$(GRN)>>> docker compose up$(DFT)"

# down:
# 	@sudo docker-compose -f ./srcs/docker-compose.yml down;
# 	@echo "$(YLW)>>> docker compose down$(DFT)"


# clean: 
# 	@sudo docker-compose -f ./srcs/docker-compose.yml down --rmi all --volumes
# 	@echo "$(RED)>>> docker stop and remove volume, networks and caches$(DFT)"

# fclean: clean
# 	@sudo rm -rf $(VOLUME_PATH)/mariadb
# 	@sudo rm -rf $(VOLUME_PATH)/wordpress
# 	@echo "$(RED)>>> remove your volume files$(DFT)"
# # remove files from the volumes (you need to fill it)

# .PHONY: up down clean fclean