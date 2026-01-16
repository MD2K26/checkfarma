@echo off
echo ==========================================
echo   CONECTANDO AO SEU REPOSITORIO
echo ==========================================

echo.
echo 1. Removendo conexao antiga...
git remote remove origin

echo.
echo 2. Adicionando o seu link correto...
git remote add origin https://github.com/Luizob32/Check-Famra.git

echo.
echo 3. Enviando arquivos...
git push -u origin main

echo.
echo ==========================================
echo SUCESSO! SEU CODIGO ESTA NO GITHUB.
echo ==========================================
pause
