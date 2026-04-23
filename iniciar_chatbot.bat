
@echo off
:: Arquivo em formato simples para evitar erro de codificacao
cd /d %~dp0

title Assistente Arthromed

echo ======================================================
echo    INICIALIZANDO ASSISTENTE VIRTUAL ARTHROMED
echo ======================================================
echo.

:: --- VERIFICACAO DO PYTHON ---
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

:: --- AMBIENTE VIRTUAL ---
if not exist venv (
    echo Criando ambiente virtual...
    %PY_CMD% -m venv venv
)

:: --- DEPENDENCIAS ---
call venv\Scripts\activate
if not exist .dependencies_installed (
    echo Instalando ferramentas necessarias (isso so ocorre uma vez)...
    pip install -r requirements.txt
    echo ok > .dependencies_installed
)

:: --- INICIO ---
echo.
echo ======================================================
echo    TUDO PRONTO! INICIANDO...
echo ======================================================
echo.
python main.py

pause
