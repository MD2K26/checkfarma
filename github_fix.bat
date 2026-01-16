@echo off
echo ==========================================
echo   CORRECAO DE UPLOAD - Drogaria ABC
echo ==========================================

echo.
echo O erro aconteceu porque o Git nao sabia "quem" estava fazendo o commit.
echo Vamos resolver isso configurando um usuario para este projeto.
echo.

REM Configura identidade local para evitar erro (pode colocar o seu se quiser depois)
git config user.email "admin@drogaria.com"
git config user.name "Drogaria Admin"

echo 1. Tentando salvar arquivos novamente...
git add .
git commit -m "Commit Inicial: App Completo"

echo.
echo 2. Verificando branch...
git branch -M main

echo.
echo 3. Verificando conexao remota...
set /p REPO_URL="Cole a URL do repositorio aqui (de novo): "
git remote remove origin
git remote add origin %REPO_URL%

echo.
echo 4. Enviando agora...
git push -u origin main

echo.
echo ==========================================
echo Se apareceu "Branch 'main' set up to track...", DEU CERTO!
echo ==========================================
pause
