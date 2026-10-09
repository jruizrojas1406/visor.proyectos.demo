@echo off
title Visor de Proyectos - Demo Local
echo ========================================================
echo  INICIANDO VISOR DE PROYECTOS (MODO DEMO LOCAL)
echo ========================================================
echo.
echo 1. Abriendo aplicacion en el navegador predeterminado...
start http://localhost:3000
echo 2. Iniciando servidor web ligero...
node serve.js
pause

