# Configurações do app unificadas

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLineEdit, QScrollArea, QLabel, QFrame, QSizePolicy,
    QGraphicsDropShadowEffect
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QPoint, QSize, QPropertyAnimation, QEasingCurve, QRect
from PyQt6.QtGui import QColor, QFont, QIcon, QPainter, QPainterPath, QBrush, QPixmap

from app.engine import ArthromedEngine

# Configurações de UI Premium
WIDGET_WIDTH = 380
WIDGET_HEIGHT = 620
ICON_SIZE = 60
MARGIN = 20

COLOR_PRIMARY = "#007B8F"
COLOR_SECONDARY = "#00A5BC"
COLOR_BG = "#FFFFFF"
COLOR_TEXT = "#333333"
COLOR_SUBTEXT = "#666666"
COLOR_BUBBLE_AI = "#E9F2F5"

# Worker para não travar a UI durante a requisição à API
class WorkerThread(QThread):
    response_signal = pyqtSignal(str)
    error_signal = pyqtSignal(str)

    def __init__(self, engine, prompt, setor, historico_texto):
        super().__init__()
        self.engine = engine
        self.prompt = prompt
        self.setor = setor
        self.historico_texto = historico_texto

    def run(self):
        try:
            contexto_busca = f"{self.historico_texto[-200:]} {self.prompt}" if self.historico_texto else self.prompt
            contexto = self.engine.buscar_contexto(contexto_busca, self.setor, historico=self.historico_texto)
            resposta = self.engine.gerar_resposta(self.prompt, self.setor, contexto)
            self.response_signal.emit(resposta)
        except Exception as e:
            self.error_signal.emit(str(e))

class FloatingWidget(QMainWindow):
    def __init__(self):
        super().__init__()
        self.engine = ArthromedEngine()
        self.setor = None
        self.is_open = False
        self.historico = []
        
        self.initUI()

    def initUI(self):
        # Configurações da Janela
        self.setWindowFlags(Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.FramelessWindowHint | Qt.WindowType.Tool | Qt.WindowType.NoDropShadowWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        # Container Central
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Layout Principal (Sobreposição)
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        # --- PAINEL DO CHAT ---
        self.chat_panel = QFrame()
        self.chat_panel.setObjectName("chatPanel")
        self.chat_panel.setStyleSheet(f"""
            #chatPanel {{
                background-color: {COLOR_BG};
                border-radius: 24px;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }}
        """)
        
        # Sombra do Painel
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(25)
        shadow.setXOffset(0)
        shadow.setYOffset(10)
        shadow.setColor(QColor(0, 0, 0, 40))
        self.chat_panel.setGraphicsEffect(shadow)
        
        self.chat_layout = QVBoxLayout(self.chat_panel)
        self.chat_layout.setContentsMargins(0, 0, 0, 0)
        self.chat_layout.setSpacing(0)
        
        # Header do Chat
        self.header = QFrame()
        self.header.setObjectName("header")
        self.header.setStyleSheet(f"""
            #header {{
                background-color: {COLOR_PRIMARY};
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
            }}
        """)
        self.header_layout = QHBoxLayout(self.header)
        self.header_layout.setContentsMargins(20, 15, 20, 15)
        
        self.header_icon = QLabel("\uE99A") # Sparkles / AI Icon
        self.header_icon.setStyleSheet("""
            font-family: 'Segoe Fluent Icons', 'Segoe MDL2 Assets';
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 18px;
            border-radius: 18px;
            min-width: 36px;
            min-height: 36px;
            max-width: 36px;
            max-height: 36px;
        """)
        self.header_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        self.header_title_layout = QVBoxLayout()
        self.header_title = QLabel("MedIA")
        self.header_title.setStyleSheet("color: white; font-weight: bold; font-size: 18px;")
        self.header_subtitle = QLabel("Assistente Arthromed")
        self.header_subtitle.setStyleSheet("color: rgba(255,255,255,0.8); font-size: 12px;")
        self.header_title_layout.setSpacing(0)
        self.header_title_layout.addWidget(self.header_title)
        self.header_title_layout.addWidget(self.header_subtitle)
        
        self.header_layout.addWidget(self.header_icon)
        self.header_layout.addLayout(self.header_title_layout)
        self.header_layout.addStretch()
        
        # Controles extras no header
        self.header_controls_layout = QHBoxLayout()
        
        self.back_button = QPushButton("\uE72B")
        self.back_button.setToolTip("Mudar de Setor")
        self.back_button.setStyleSheet("""
            QPushButton {
                font-family: "Segoe Fluent Icons", "Segoe MDL2 Assets";
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                border-radius: 15px;
                min-width: 30px;
                min-height: 30px;
                max-width: 30px;
                max-height: 30px;
                font-size: 14px;
                padding-bottom: 2px;
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 0.4);
            }
        """)
        self.back_button.clicked.connect(self.reset_sector)
        self.back_button.hide()
        
        self.quit_button = QPushButton("\uE711") # X icon
        self.quit_button.setToolTip("Fechar")
        self.quit_button.setStyleSheet("""
            QPushButton {
                font-family: "Segoe Fluent Icons", "Segoe MDL2 Assets";
                background: transparent;
                color: white;
                border: none;
                font-size: 16px;
            }
            QPushButton:hover {
                color: #ff4757;
            }
        """)
        self.quit_button.clicked.connect(self.toggle_chat)
        
        self.header_controls_layout.addWidget(self.back_button)
        self.header_controls_layout.addWidget(self.quit_button)
        
        self.header_layout.addLayout(self.header_controls_layout)
        
        # Área de Scroll do Chat
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        
        self.scroll_widget = QWidget()
        self.scroll_widget.setStyleSheet("background: transparent;")
        self.messages_layout = QVBoxLayout(self.scroll_widget)
        self.messages_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.messages_layout.setContentsMargins(10, 10, 10, 10)
        self.messages_layout.setSpacing(8)
        self.scroll_area.setWidget(self.scroll_widget)
        
        # Input Area
        self.input_area = QFrame()
        self.input_area.setStyleSheet(f"background: white; border-top: 1px solid rgba(0,0,0,0.05); border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; padding: 12px;")
        self.input_layout = QHBoxLayout(self.input_area)
        self.input_layout.setContentsMargins(10, 10, 10, 10)
        
        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Escreva algo aqui...")
        self.input_field.setStyleSheet(f"""
            QLineEdit {{
                border: 1px solid #E0E0E0;
                border-radius: 20px;
                padding: 10px 18px;
                font-size: 14px;
                background: #F8F9FA;
                color: {COLOR_TEXT};
            }}
            QLineEdit:focus {{
                border: 2px solid {COLOR_PRIMARY};
                background: white;
            }}
        """)
        self.input_field.returnPressed.connect(self.send_message)
        
        self.send_button = QPushButton("\uE724")
        self.send_button.setStyleSheet(f"""
            QPushButton {{
                font-family: "Segoe Fluent Icons", "Segoe MDL2 Assets";
                background: #B4DBE4;
                color: white;
                border-radius: 18px;
                min-width: 36px;
                min-height: 36px;
                max-width: 36px;
                max-height: 36px;
                font-size: 16px;
                padding-left: 2px;
            }}
            QPushButton:hover {{
                background: {COLOR_PRIMARY};
            }}
        """)
        self.send_button.clicked.connect(self.send_message)
        
        self.input_layout.addWidget(self.input_field)
        self.input_layout.addWidget(self.send_button)
        
        # Tab Bar (Setores)
        self.tabs_container = QFrame()
        self.tabs_container.setStyleSheet("background: white; border-bottom: 1px solid #eee;")
        self.tabs_layout = QHBoxLayout(self.tabs_container)
        self.tabs_layout.setContentsMargins(10, 10, 10, 10)
        self.tabs_layout.setSpacing(10)
        
        self.sector_tabs = []
        setores = [
            ("Geral", "\uE80F"), # Home
            ("Financeiro", "\uE8C7"), # Calculator
            ("Comercial", "\uE8BF") # Cart
        ]
        
        for name, icon in setores:
            btn = QPushButton(f" {icon} {name}")
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setObjectName(name)
            btn.setStyleSheet(self.get_tab_style(False))
            btn.clicked.connect(lambda checked, n=name: self.select_sector(n))
            self.tabs_layout.addWidget(btn)
            self.sector_tabs.append(btn)
            
        self.chat_layout.addWidget(self.header)
        self.chat_layout.addWidget(self.tabs_container)
        self.chat_layout.addWidget(self.scroll_area)
        self.chat_layout.addWidget(self.input_area)
        
        # --- BOTÃO FLUTUANTE DE TOGGLE ---
        self.toggle_button = QPushButton("\uE8BD") # Chat Bubble Outline
        self.toggle_button.setStyleSheet(f"""
            QPushButton {{
                font-family: "Segoe Fluent Icons", "Segoe MDL2 Assets";
                background-color: {COLOR_PRIMARY};
                color: white;
                border-radius: 30px;
                font-size: 28px;
                font-weight: normal;
                padding-bottom: 4px;
            }}
            QPushButton:hover {{
                background-color: {COLOR_SECONDARY};
            }}
        """)
        self.toggle_button.setFixedSize(ICON_SIZE, ICON_SIZE)
        
        # Sombra do Botão (Glow Teal)
        btn_shadow = QGraphicsDropShadowEffect()
        btn_shadow.setBlurRadius(25)
        btn_shadow.setXOffset(0)
        btn_shadow.setYOffset(5)
        btn_shadow.setColor(QColor(0, 123, 143, 100))
        self.toggle_button.setGraphicsEffect(btn_shadow)
        
        self.toggle_button.clicked.connect(self.toggle_chat)
        
        # --- POSICIONAMENTO ABSOLUTO NO LAYOUT MAIN ---
        # Como queremos sobrepor o botao e o painel, usamos um contêiner absoluto
        self.chat_panel.setFixedSize(WIDGET_WIDTH, WIDGET_HEIGHT - ICON_SIZE - 5)
        
        self.main_layout.addWidget(self.chat_panel)
        self.main_layout.addWidget(self.toggle_button, alignment=Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignBottom)
        
        self.chat_panel.hide()
        self.setup_sector_selection()
        self.position_widget(open=False)
        self.update_mask()

    def update_mask(self):
        from PyQt6.QtGui import QRegion
        if self.is_open:
            # Unifica a área do painel de chat e a área do botão
            mask = QRegion(self.chat_panel.geometry())
            mask = mask.united(QRegion(self.toggle_button.geometry()))
            self.setMask(mask)
        else:
            # Apenas o círculo do botão quando fechado
            mask = QRegion(0, 0, ICON_SIZE, ICON_SIZE, QRegion.RegionType.Ellipse)
            self.setMask(mask)

    def position_widget(self, open=True):
        # availableGeometry() já desconta a barra de tarefas automaticamente
        screen = QApplication.primaryScreen().availableGeometry()
        
        if open:
            w, h = WIDGET_WIDTH, WIDGET_HEIGHT
        else:
            w, h = ICON_SIZE, ICON_SIZE
            
        x = screen.x() + screen.width() - w - MARGIN
        y = screen.y() + screen.height() - h - MARGIN
        
        self.setFixedSize(w, h)
        self.setGeometry(x, y, w, h)
        self.update_mask()

    def toggle_chat(self):
        self.is_open = not self.is_open
        if self.is_open:
            self.chat_panel.show()
            self.toggle_button.hide()
            self.position_widget(open=True)
        else:
            self.chat_panel.hide()
            self.toggle_button.show()
            self.toggle_button.setText("\uE8BD")
            self.position_widget(open=False)
        self.update_mask()

    def reset_sector(self):
        self.setup_sector_selection()

    def get_tab_style(self, active):
        if active:
            return f"""
                QPushButton {{
                    font-family: 'Segoe Fluent Icons', 'Inter', sans-serif;
                    background: white;
                    color: {COLOR_PRIMARY};
                    border: 1px solid #B4DBE4;
                    border-radius: 12px;
                    padding: 8px 15px;
                    font-size: 13px;
                    font-weight: bold;
                }}
            """
        else:
            return """
                QPushButton {
                    font-family: 'Segoe Fluent Icons', 'Inter', sans-serif;
                    background: transparent;
                    color: #666;
                    border: 1px solid transparent;
                    border-radius: 12px;
                    padding: 8px 15px;
                    font-size: 13px;
                }
                QPushButton:hover {
                    background: #f5f5f5;
                }
            """

    def setup_sector_selection(self):
        self.setor = "Geral"
        self.select_sector("Geral")

    def select_sector(self, setor):
        self.setor = setor
        self.historico = []
        
        # Atualiza estilo das tabs
        for btn in self.sector_tabs:
            btn.setStyleSheet(self.get_tab_style(btn.objectName() == setor))
            
        self.input_area.show()
        
        # Limpar mensagens antigas
        for i in reversed(range(self.messages_layout.count())): 
            self.messages_layout.itemAt(i).widget().setParent(None)
            
        welcome_msg = "Olá! Sou a MedIA, assistente da Arthromed. Selecione um setor e me pergunte sobre processos, materiais ou fluxos internos."
        if setor != "Geral":
            welcome_msg = f"Estou pronta para ajudar no setor **{setor}**. O que você deseja saber?"
            
        self.add_message("assistant", welcome_msg)

    def add_message(self, role, text):
        container = QWidget()
        layout = QHBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        
        msg_label = QLabel(text)
        msg_label.setWordWrap(True)
        msg_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        msg_label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        
        if role == "user":
            msg_label.setStyleSheet(f"""
                background: {COLOR_PRIMARY};
                color: white;
                border-radius: 15px;
                border-bottom-right-radius: 2px;
                padding: 10px 15px;
                font-size: 14px;
            """)
            layout.addStretch()
            layout.addWidget(msg_label)
        else:
            msg_label.setStyleSheet(f"""
                background: {COLOR_BUBBLE_AI};
                color: #2C5E67;
                border-radius: 15px;
                border-bottom-left-radius: 2px;
                padding: 10px 15px;
                font-size: 14px;
            """)
            layout.addWidget(msg_label)
            layout.addStretch()
            
        self.messages_layout.addWidget(container)
        
        # Scroll para o final
        self.scroll_area.verticalScrollBar().setValue(self.scroll_area.verticalScrollBar().maximum())

    def send_message(self):
        text = self.input_field.text().strip()
        if not text:
            return
            
        self.input_field.clear()
        self.add_message("user", text)
        self.historico.append({"role": "user", "content": text})
        
        self.input_field.setEnabled(False)
        self.send_button.setEnabled(False)
        self.input_field.setPlaceholderText("⏳ Digitando...")
        
        historico_user = [m["content"] for m in self.historico if m["role"] == "user"]
        historico_texto = " ".join(historico_user[:-1])
        
        self.worker = WorkerThread(self.engine, text, self.setor, historico_texto)
        self.worker.response_signal.connect(self.handle_response)
        self.worker.error_signal.connect(self.handle_error)
        self.worker.start()

    def handle_response(self, text):
        self.add_message("assistant", text)
        self.historico.append({"role": "assistant", "content": text})
        self.restore_input()

    def handle_error(self, err):
        self.add_message("assistant", f"❌ Erro de conexão: {err}")
        self.restore_input()
        
    def restore_input(self):
        self.input_field.setEnabled(True)
        self.send_button.setEnabled(True)
        self.input_field.setPlaceholderText("Digite sua mensagem...")
        self.input_field.setFocus()
        self.scroll_area.verticalScrollBar().setValue(self.scroll_area.verticalScrollBar().maximum())



