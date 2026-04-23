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
    echo    🤖 PREPARANDO O ASSISTENTE (PRIMEIRA VEZ)
    echo ======================================================
    echo.
    echo ⏳ Passo 1/2: Baixando ferramentas basicas...
    echo [TEMPO ESTIMADO: 1 a 2 MINUTOS]
    echo.
    
    :: Executa a instalacao
    pip install -r requirements.txt --quiet
    
    echo ⏳ Passo 2/2: Baixando motor de IA (isso so ocorre uma vez)...
    echo [TEMPO ESTIMADO: 1 MINUTO]
    echo.
    python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='intfloat/multilingual-e5-small')"
    
    echo ok > .dependencies_installed
    
    echo ✅ Tudo pronto! O chat vai abrir agora...
    timeout /t 3 >nul
)

echo.
echo ======================================================
echo    TUDO PRONTO! INICIANDO...
echo ======================================================
echo.
python main.py

pause
