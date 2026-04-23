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
    echo Instalando ferramentas...
    pip install -r requirements.txt
    echo ok > .dependencies_installed
)

echo.
echo ======================================================
echo    TUDO PRONTO! INICIANDO...
echo ======================================================
echo.
python main.py

pause
