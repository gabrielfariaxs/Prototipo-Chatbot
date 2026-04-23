@echo off
title Assistente Virtual Arthromed
echo ======================================================
echo    🤖 INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED
echo ======================================================
echo.

:: Verifica se o Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado! 
    echo Por favor, instale o Python em https://www.python.org/
    echo Certifique-se de marcar a opcao "Add Python to PATH" na instalacao.
    pause
    exit
)

:: Verifica se existe o ambiente virtual, se não, cria
if not exist venv (
    echo Criando ambiente virtual para o primeiro uso...
    python -m venv venv
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
python main.py

pause
