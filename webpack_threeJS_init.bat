@echo off

set app=%1

if "%app%"=="" (
    goto end
)

if exist %app% (
   echo %app% is existed, please change your app name!
   goto eof
) 

mkdir %app%\src\js
mkdir %app%\src\css
mkdir %app%\src\assets\models
mkdir %app%\src\assets\textures
mkdir %app%\src\assets\materials
mkdir %app%\src\assets\images
mkdir %app%\src\assets\icons
mkdir %app%\src\assets\fonts
mkdir %app%\src\assets\audios
mkdir %app%\src\assets\videos

cd %app%

copy ..\index.html  .\src\
copy ..\index.js  .\src\
copy ..\icon.png  .\src\assets\
copy ..\main.css  .\src\
copy ..\webpack.config.js  .\

call cmd /k "npm init -y && npm install webpack webpack-cli --save-dev && npm install --save-dev html-webpack-plugin  copy-webpack-plugin webpack-dev-server  three && @exit"

echo %app% is created! Please enjoy!

code ./ 

goto bye


:end

echo Please input the app name!

:eof

PAUSE

:bye
