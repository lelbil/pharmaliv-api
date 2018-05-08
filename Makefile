restart:
	@make quit
	@make start

start:
	@docker-compose up -d --build
	@sleep 5
	@make migrate
	@make applog

quit:
	@docker-compose stop
	@docker-compose rm -f

applog:
	@docker logs api -f

migrate:
	@node_modules/.bin/knex migrate:latest