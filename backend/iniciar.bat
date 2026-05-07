@echo off
cd /d %~dp0
title Arthromed Web Assistant

echo ======================================================
echo    INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED (WEB)
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

echo ⏳ Verificando dependencias...
pip install -r requirements.txt --quiet
echo ✅ Dependencias prontas!

echo.
echo ======================================================
echo    INICIANDO INTERFACE WEB...
echo ======================================================
echo Iniciando o chatbot de area de trabalho...
start pythonw front\desktop_app.py
echo Assistente iniciado. Verifique o icone no canto inferior direito!

pause
