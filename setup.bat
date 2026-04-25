@echo off
echo ===================================================
echo Iniciando o Backend Analytics Dashboard...
echo ===================================================

echo.
echo [1/4] Subindo a infraestrutura (Docker)...
docker compose up -d --build

echo.
echo [2/4] Aguardando o PostgreSQL inicializar (5 segundos)...
timeout /t 5 /nobreak > NUL

echo.
echo [3/4] Executando as migracoes do Banco de Dados...
docker compose exec web python manage.py migrate

echo.
echo [4/4] Carregando os dados do CSV (Isso pode levar alguns segundos)...
docker compose exec web python manage.py load_csv

echo.
echo ===================================================
echo Tudo pronto! Servidor rodando :)
echo Teste a API em: http://localhost:8000/api/electricity/dashboard/
echo ===================================================