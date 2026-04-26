@echo off
echo ===================================================
echo Iniciando o Backend Analytics Dashboard...
echo ===================================================

echo.
echo [1/5] Subindo a infraestrutura (Docker)...
docker compose up -d --build

echo.
echo [2/5] Aguardando o Django inicializar...
set HEALTH_URL=http://localhost:8000/api/electricity/health/
set MAX_WAIT=60
set WAITED=0
:healthloop
if %WAITED% GEQ %MAX_WAIT% (
    echo ERRO: Django nao respondeu em %MAX_WAIT%s.
    exit /b 1
)
python -c "import urllib.request; urllib.request.urlopen('%HEALTH_URL%')" >nul 2>&1 && goto :healthready
timeout /t 3 /nobreak >nul
set /a WAITED+=3
goto :healthloop
:healthready
echo Django pronto (%WAITED%s).

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
echo Iniciando o frontend...
docker compose up -d

echo.
echo ===================================================
echo Tudo pronto! Servidor rodando.
echo Teste a API em: http://localhost:8000/api/electricity/dashboard/
echo Teste o Frontend em: http://localhost:5173/
echo ===================================================