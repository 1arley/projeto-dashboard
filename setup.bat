@echo off
echo ===================================================
echo Iniciando o Backend Analytics Dashboard...
echo ===================================================

echo.
echo [1/5] Subindo a infraestrutura (Docker)...
docker compose up -d --build --wait

echo.
echo [2/5] Aguardando o PostgreSQL inicializar...
rem --wait aguarda todos os healthchecks antes de prosseguir

echo.
echo [3/5] Executando as migracoes do Banco de Dados...
docker compose exec web python manage.py migrate

echo.
echo [4/5] Carregando os dados do CSV (Isso pode levar alguns segundos)...
docker compose exec web python manage.py load_csv

echo.
echo [5/5] Coletando arquivos estaticos...
docker compose exec web python manage.py collectstatic --noinput

echo.
echo ===================================================
echo Tudo pronto! Servidor rodando.
echo Teste a API em: http://localhost:8000/api/electricity/dashboard/
echo Teste o Frontend em: http://localhost:5173/
echo ===================================================