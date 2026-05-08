import tkinter as tk
import os
import requests
import time
import threading
import subprocess
import sys

# Arquivo de trava para garantir instância única do chat
LOCK_FILE = os.path.join(os.environ.get('TEMP', '.'), "media_chat.lock")

# Configurações
CHAT_URL = "https://chatbot.gabrielfarias-marques13.workers.dev/?desktop=true"

def run_as_window():
    """Função que roda apenas a janela do chat (pywebview)"""
    if os.path.exists(LOCK_FILE):
        print("Já existe uma janela de chat aberta.")
        return

    try:
        import webview
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview"])
        import webview

    if not CHAT_URL:
        print("URL do chat não configurada.")
        return

    # Cria o arquivo de trava
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))

    try:
        window = webview.create_window(
            'MedIA - Assistente Virtual', 
            CHAT_URL,
            width=400,
            height=540,
            resizable=True,
            on_top=True
        )
        webview.start()
    finally:
        # Remove a trava ao fechar
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)

def open_chat_process():
    """Dispara um novo processo para a janela do chat"""
    if os.path.exists(LOCK_FILE):
        print("Chat já ativo (lock file presente).")
        return
    
    # Chama o próprio script com a flag --window
    subprocess.Popen([sys.executable, __file__, "--window"])

def create_floating_widget():
    """Cria o ícone flutuante do desktop (Tkinter)"""
    root = tk.Tk()
    root.title("MedIA Widget")
    
    # Garantir que não existam travas órfãs ao iniciar o app principal
    if os.path.exists(LOCK_FILE):
        try:
            os.remove(LOCK_FILE)
        except:
            pass

    # Remove bordas e mantem sempre no topo
    root.overrideredirect(True)
    root.wm_attributes("-topmost", True)
    
    transparent_color = "#00FF00"
    root.config(bg=transparent_color)
    root.wm_attributes("-transparentcolor", transparent_color)
    
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    w, h = 80, 80
    x = screen_width - w - 40
    y = screen_height - h - 160
    root.geometry(f"{w}x{h}+{x}+{y}")
    
    logo_path = os.path.join("web", "public", "logo.png")
    
    try:
        from PIL import Image, ImageTk
        pil_img = Image.open(logo_path)
        pil_img = pil_img.resize((60, 60), Image.Resampling.LANCZOS)
        img = ImageTk.PhotoImage(pil_img)
    except Exception:
        img = None

    lbl = tk.Label(root, image=img if img else None, text="MedIA" if not img else "", 
                   font=("Arial", 14, "bold"), bg=transparent_color, cursor="hand2")
    if img: lbl.image = img
    lbl.pack(expand=True, fill="both")
    
    # Estado do Mouse
    mouse_data = {"x": 0, "y": 0, "start_x": 0, "start_y": 0}

    def start_move(event):
        mouse_data["x"] = event.x
        mouse_data["y"] = event.y
        mouse_data["start_x"] = event.x_root
        mouse_data["start_y"] = event.y_root

    def do_move(event):
        deltax = event.x - mouse_data["x"]
        deltay = event.y - mouse_data["y"]
        root.geometry(f"+{root.winfo_x() + deltax}+{root.winfo_y() + deltay}")

    def stop_move(event):
        dist = ((event.x_root - mouse_data["start_x"])**2 + (event.y_root - mouse_data["start_y"])**2)**0.5
        if dist < 5: # Clique
            open_chat_process()

    lbl.bind("<ButtonPress-1>", start_move)
    lbl.bind("<B1-Motion>", do_move)
    lbl.bind("<ButtonRelease-1>", stop_move)
    
    print("Widget MedIA iniciado!")
    root.mainloop()

if __name__ == "__main__":
    if "--window" in sys.argv:
        run_as_window()
    else:
        create_floating_widget()


