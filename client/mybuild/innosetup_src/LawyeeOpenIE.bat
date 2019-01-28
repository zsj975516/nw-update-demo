@echo off
set m=%1%
set m=%m:openIE:=%
start "" iexplore.exe %m%
exit