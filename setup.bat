@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Energy Pulse - Dashboard Analitico
echo ===================================================

echo.
echo [1/8] Verificando dependencias...
set HAS_DOCKER=0
set HAS_PYTHON=0
set HAS_NPM=0

where docker >nul 2>&1
if %errorlevel% equ 0 (
    set HAS_DOCKER=1
) else (
    echo [ERRO] Docker nao encontrado. Instale o Docker Desktop.
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    set HAS_PYTHON=1
) else (
    echo [AVISO] Python nao encontrado. Alguns passos serao pulados.
)

where npm >nul 2>&1
if %errorlevel% equ 0 (
    set HAS_NPM=1
)

echo Docker: OK ^| Python: !HAS_PYTHON! ^| NPM: !HAS_NPM!

echo.
echo [2/8] Verificando arquivo .env...
if not exist .env (
    echo.
    echo [ERRO] Arquivo .env nao encontrado!
    echo Execute: copy .env.example .env
    echo.
    pause
    exit /b 1
)
echo .env encontrado.

echo.
echo [3/8] Limpando ambiente anterior (containers, volumes)...
docker compose down -v >nul 2>&1
echo Ambiente limpo.

echo.
echo [4/8] Instalando dependencias do frontend...
if !HAS_NPM! equ 1 (
    echo NPM encontrado. Instalando dependencias...
    cd frontend
    call npm ci --ignore-scripts
    cd ..
) else (
    echo NPM nao encontrado. O Docker ira instalar as dependencias.
)

echo.
echo [5/8] Subindo a infraestrutura (Docker)...
docker compose up -d --build --wait
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo [ERRO] Falha ao subir os containers. Logs:
    echo ===================================================
    docker compose logs --tail 60
    echo ===================================================
    echo.
    echo Corrija os erros acima e tente novamente.
    pause
    exit /b 1
)
echo Containers prontos e saudaveis.

echo.
echo [6/8] Executando as migracoes do Banco de Dados...
docker compose exec web python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERRO] Falha nas migracoes. Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo [7/8] Carregando os dados do CSV...
if not exist electricity.csv (
    echo [AVISO] Arquivo electricity.csv nao encontrado. Pulando carga de dados.
) else (
    docker compose exec web python manage.py load_csv
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao carregar CSV. Verifique os logs acima.
        pause
        exit /b 1
    )
)

echo.
echo [8/8] Coletando arquivos estaticos...
docker compose exec web python manage.py collectstatic --noinput

echo.
echo ===================================================
echo Tudo pronto! Servidor rodando.
echo Teste a API em: http://localhost:8000/api/v1/electricity/dashboard/
echo Teste o Frontend em: http://localhost:5173/
echo ===================================================
echo.
pause
