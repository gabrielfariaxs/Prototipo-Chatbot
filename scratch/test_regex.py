
import re

linha = "500120030 FASTFIT 2.5 AJUSTAVEL ACB (FAB 15-25M) RAZEK EQUIPAMENTOS 7.300,001 ?"
# PA02030007 DISSECTOR RETO 52X3 TRAUMEC TRAUMEC 1.250,001 
linha2 = "PA02030007 DISSECTOR RETO 52X3 TRAUMEC TRAUMEC 1.250,001 "

# O padrão no PDF parece ser: CÓDIGO DESCRIÇÃO MARCA VALOR QTDADE
# Mas o valor tem vírgula. 7.300,00

regex = r'^([A-Z0-9\-/.]+)\s+(.*?)\s+([A-Z\s]+)\s+[\d.,]+\s*(\d+)'

m1 = re.match(regex, linha)
m2 = re.match(regex, linha2)

if m1:
    print("M1 Match!")
    print("Cod:", m1.group(1))
    print("Desc:", m1.group(2))
    print("Marca:", m1.group(3))
else:
    print("M1 No match")

if m2:
    print("M2 Match!")
    print("Cod:", m2.group(1))
    print("Desc:", m2.group(2))
    print("Marca:", m2.group(3))
else:
    print("M2 No match")
