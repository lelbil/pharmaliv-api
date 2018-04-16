restart:
	@make quit
	@make start

start:
	@docker-compose up -d --build
	@sleep 1
	@make migrate

quit:
	@docker-compose stop
	@docker-compose rm -f

debug:
	@docker-compose up --build

restart-debug:
	@make quit
	@make debug

migrate:
	@node_modules/.bin/knex migrate:latest