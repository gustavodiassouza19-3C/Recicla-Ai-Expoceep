@echo off
:: Execute como Administrador para desativar sleep/hibernate
powercfg /hibernate off
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /setdcvalueindex SCHEME_CURRENT SUB_BUTTONS LIDACTION 0
powercfg /setactive SCHEME_CURRENT
echo ============================================
echo  Configuracao concluida!
echo  - Tampa nao suspende (bateria e tomada)
echo  - Sleep desativado
echo  - Hibernate desativado
echo ============================================
pause
