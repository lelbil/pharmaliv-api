restart:
	@make quit
	@make start

start:
	@docker-compose up -d --build
	@make migrate

setup:
	@make start
	@make populate_db

quit:
	@docker-compose stop
	@docker-compose rm -f

migrate:
	@node_modules/.bin/knex migrate:latest