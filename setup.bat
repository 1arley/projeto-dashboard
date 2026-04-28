@echo off
echo ===================================================
echo Energy Pulse - Dashboard Analitico
echo ===================================================

echo.
echo [1/7] Verificando arquivo .env...
if not exist .env (
    echo.
    echo ERRO: Arquivo .env nao encontrado!
    echo Execute: copy .env.example .env
    echo.
    pause
    exit /b 1
)

echo.
echo [2/7] Instalando dependencias do frontend (se npm existir)...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    echo NPM encontrado. Instalando dependencias...
    cd frontend
    call npm ci --ignore-scripts
    cd ..
) else (
    echo ⚠️  NPM nao encontrado. Docker ira instalar.
)

echo.
echo [3/7] Subindo a infraestrutura (Docker)...
docker compose up -d --build --wait

echo.
echo [4/7] Aguardando o Django inicializar...
set HEALTH_URL=http://localhost:8000/api/v1/electricity/health/
set MAX_WAIT=60
set WAITED=0
:healthloop
if %WAITED% GEQ %MAX_WAIT% (
    echo ERRO: Django nao respondeu em %MAX_WAIT%s.
    pause
    exit /b 1
)
python -c "import urllib.request; urllib.request.urlopen('%HEALTH_URL%')" >nul 2>&1 && goto :healthready
timeout /t 3 /nobreak >nul 2
set /a WAITED+=3
goto :healthloop
:healthready
echo Django pronto (%WAITED%s).

echo.
echo [5/7] Executando as migracoes do Banco de Dados...
docker compose exec web python manage.py migrate

echo.
echo [6/7] Carregando os dados do CSV (Isso pode levar alguns segundos)...
docker compose exec web python manage.py load_csv

echo.
echo [7/7] Coletando arquivos estaticos...
docker compose exec web python manage.py collectstatic --noinput

echo.
echo ===================================================
echo Tudo pronto! Servidor rodando.
echo Teste a API em: http://localhost:8000/api/v1/electricity/dashboard/
echo Teste o Frontend em: http://localhost:5173/
echo ===================================================
echo.
pause
