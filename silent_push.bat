@echo off
set GIT_CMD="C:\Program Files\Git\cmd\git.exe"

rmdir /s /q .git
%GIT_CMD% init
%GIT_CMD% config user.email "admin@drogaria.com"
%GIT_CMD% config user.name "Drogaria Admin"
%GIT_CMD% add .
%GIT_CMD% commit -m "Fix unused variables for Vercel Build"
%GIT_CMD% branch -M main
%GIT_CMD% remote add origin https://github.com/Luizob32/Check-Famra.git
%GIT_CMD% push -u origin main --force
