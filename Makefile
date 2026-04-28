.PHONY: setup dev test test-coverage env-check env

env:
	@if [ ! -f .env ]; then \
		echo "📝 Criando .env a partir de .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env criado."; \
	else \
		echo "✅ .env já existe. Use 'make env-renew' para recriar."; \
	fi

env-renew:
	@echo "⚠️  Substituindo .env existente..."
	@read -p "Tem certeza? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		rm -f .env; \
		cp .env.example .env; \
		echo "✅ Novo .env criado."; \
	else \
		echo "Operação cancelada."; \
	fi

env-check:
	@if [ ! -f .env ]; then \
		echo "❌ ERRO: Arquivo .env não encontrado!"; \
		echo "   Execute: cp .env.example .env"; \
		exit 1; \
	fi
	@if ! grep -q "SECRET_KEY=" .env || grep -q "SECRET_KEY=change-me" .env; then \
		echo "❌ ERRO: SECRET_KEY não configurada no .env!"; \
		echo "   Edite .env e adicione uma SECRET_KEY válida"; \
		echo "   Dica: openssl rand -hex 32"; \
		exit 1; \
	fi

setup: env-check
	@echo "Instalando dependências do frontend (se npm existir)..."
	@if command -v npm >/dev/null 2>&1; then \
		echo "NPM encontrado. Instalando dependências..."; \
		cd frontend && npm ci --ignore-scripts; \
	else \
		echo "⚠️  NPM não encontrado. Pulando instalação local (Docker irá instalar)."; \
	fi
	@echo "Iniciando infraestrutura..."
	docker compose up -d --build --wait
	@echo "Rodando migrações..."
	docker compose exec web python manage.py migrate
	@echo "Carregando dados..."
	docker compose exec web python manage.py load_csv
	@echo "Coletando estáticos..."
	docker compose exec web python manage.py collectstatic --noinput
	@echo "Pronto! Backend rodando em: http://localhost:8000/api/v1/electricity/dashboard/"
	@echo "Frontend rodando em: http://localhost:5173/"


dev:
	docker compose up -d

test:
	python manage.py test apps.electricity --settings=config.test_settings --verbosity=2

test-coverage:
	python manage.py test apps.electricity --settings=config.test_settings --verbosity=2 --with-coverage 2>/dev/null || \
	python -m coverage run manage.py test apps.electricity --settings=config.test_settings && \
	python -m coverage report
