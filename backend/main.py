import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QFont
from app.ui import FloatingWidget

if __name__ == '__main__':
    app = QApplication(sys.argv)
    
    # Define a fonte global
    font = QFont("Inter", 10)
    app.setFont(font)
    
    widget = FloatingWidget()
    widget.show()
    
    sys.exit(app.exec())
