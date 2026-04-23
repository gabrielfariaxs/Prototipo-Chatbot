
@echo off
:: Arquivo em formato simples para evitar erro de codificacao
cd /d %~dp0

title Assistente Arthromed

echo ======================================================
echo    INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED
echo ======================================================
echo.

:: Verifica se o Python esta instalado
set PY_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PY_CMD=py
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Python nao encontrado!
        echo Por favor, instale o Python e marque "Add Python to PATH".
        pause
        exit
    )
)

:: Verifica ambiente virtual
if not exist venv (
    echo Criando ambiente virtual...
    %PY_CMD% -m venv venv
)

:: Instala dependencias apenas se necessario
echo Verificando inicializacao...
call venv\Scripts\activate
if not exist .dependencies_installed (
    echo Instalando ferramentas necessarias (isso so ocorre uma vez)...
    pip install -r requirements.txt --quiet
    echo ok > .dependencies_installed
)

:: Inicia o Chatbot
echo.
echo ======================================================
echo    TUDO PRONTO! INICIANDO...
echo ======================================================
echo.
python main.py

pause
