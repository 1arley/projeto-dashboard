setup:
	@echo "Iniciando infraestrutura..."
	docker compose up -d --build
	@echo "Aguardando o banco..."
	sleep 5
	@echo "Rodando migrações..."
	docker compose exec web python manage.py migrate
	@echo "Carregando dados..."
	docker compose exec web python manage.py load_csv
	@echo "Coletando estáticos..."
	docker compose exec web python manage.py collectstatic --noinput
	@echo "Pronto! http://localhost:8000/api/electricity/dashboard/"

dev:
	docker compose up -d
