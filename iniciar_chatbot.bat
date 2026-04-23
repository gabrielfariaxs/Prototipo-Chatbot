@echo off
cd /d %~dp0
chcp 65001 >nul
title Assistente Virtual Arthromed
echo ======================================================
echo    🤖 INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED
echo ======================================================
echo.

:: Verifica se o Python está instalado (tenta 'python' e depois 'py')
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PYTHON_CMD=py
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Python não encontrado!
        echo.
        echo Para resolver:
        echo 1. Baixe o Python em: https://www.python.org/
        echo 2. Na instalação, MARQUE a caixa "Add Python to PATH".
        echo.
        pause
        exit
    )
)

:: Verifica se existe o ambiente virtual, se não, cria
if not exist venv (
    echo Criando ambiente virtual para o primeiro uso...
    %PYTHON_CMD% -m venv venv
)

:: Ativa o ambiente e instala as dependencias
echo Verificando dependencias...
call venv\Scripts\activate
pip install -r requirements.txt --quiet

:: Inicia o Chatbot
echo.
echo ======================================================
echo    ✅ TUDO PRONTO! INICIANDO O CHAT...
echo ======================================================
echo.
%PYTHON_CMD% main.py

pause
