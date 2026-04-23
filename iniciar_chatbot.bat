@echo off
cd /d %~dp0
title Assistente Arthromed

echo ======================================================
echo    INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED
echo ======================================================
echo.

set PY_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PY_CMD=py
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Python nao encontrado!
        pause
        exit
    )
)

if not exist venv (
    echo Criando ambiente virtual...
    %PY_CMD% -m venv venv
)

call venv\Scripts\activate
if not exist .dependencies_installed (
    cls
    echo ======================================================
    echo    🤖 PREPARANDO O ASSISTENTE PARA O PRIMEIRO USO
    echo ======================================================
    echo.
    echo Estamos baixando as ferramentas e dependencias...
    echo Isso pode levar de 1 a 3 minutos dependendo da sua internet.
    echo Por favor, aguarde e nao feche esta janela.
    echo.
    
    :: Executa a instalacao em silencio
    pip install -r requirements.txt --quiet
    echo ok > .dependencies_installed
)

echo.
echo ======================================================
echo    TUDO PRONTO! INICIANDO...
echo ======================================================
echo.
python main.py

pause
