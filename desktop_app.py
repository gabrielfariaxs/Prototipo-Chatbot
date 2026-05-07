import tkinter as tk
import webbrowser
import os
import requests
import time
import threading

def check_server_and_open():
    print("Aguardando o servidor MedIA...")
    for _ in range(30):
        try:
            requests.get("http://localhost:3002", timeout=1)
            webbrowser.open("http://localhost:3002")
            return
        except:
            time.sleep(1)

def on_click(event):
    # Quando clicado, abre o chat no navegador padrao
    threading.Thread(target=check_server_and_open, daemon=True).start()

def create_floating_widget():
    root = tk.Tk()
    root.title("MedIA Widget")
    
    # Remove bordas e mantem sempre no topo
    root.overrideredirect(True)
    root.wm_attributes("-topmost", True)
    
    # Define a cor verde-limao como "transparente" (key color do Windows)
    transparent_color = "#00FF00"
    root.config(bg=transparent_color)
    root.wm_attributes("-transparentcolor", transparent_color)
    
    # Posiciona no canto inferior direito
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    w, h = 80, 80
    x = screen_width - w - 40
    y = screen_height - h - 160  # Mais acima, acima da barra de tarefas
    root.geometry(f"{w}x{h}+{x}+{y}")
    
    # Carrega a imagem do logo da pasta web/public
    logo_path = os.path.join("web", "public", "logo.png")
    
    try:
        try:
            from PIL import Image, ImageTk
        except ImportError:
            print("Instalando dependencia de imagem (Pillow)...")
            import subprocess
            import sys
            subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
            from PIL import Image, ImageTk
            
        # Usa Pillow para carregar e redimensionar garantindo suporte a PNGs complexos
        pil_img = Image.open(logo_path)
        # Redimensiona para um tamanho padrao de icone (60x60)
        pil_img = pil_img.resize((60, 60), Image.Resampling.LANCZOS)
        img = ImageTk.PhotoImage(pil_img)
    except Exception as e:
        print(f"Erro ao carregar logo: {e}")
        # Fallback para um texto se a imagem falhar
        img = None

    if img:
        lbl = tk.Label(root, image=img, bg=transparent_color, cursor="hand2")
        lbl.image = img # Mantem referencia
    else:
        lbl = tk.Label(root, text="MedIA", font=("Arial", 14, "bold"), bg="white", fg="#007B8F", cursor="hand2")
        
    lbl.pack(expand=True, fill="both")
    
    # Bind de clique
    lbl.bind("<Button-1>", on_click)
    
    # Drag (Arrastar)
    def start_move(event):
        root.x = event.x
        root.y = event.y

    def stop_move(event):
        root.x = None
        root.y = None

    def do_move(event):
        deltax = event.x - root.x
        deltay = event.y - root.y
        x = root.winfo_x() + deltax
        y = root.winfo_y() + deltay
        root.geometry(f"+{x}+{y}")

    lbl.bind("<ButtonPress-1>", start_move, add="+")
    lbl.bind("<ButtonRelease-1>", stop_move, add="+")
    lbl.bind("<B1-Motion>", do_move, add="+")
    
    print("Widget MedIA inciado! Flutuando na tela.")
    root.mainloop()

if __name__ == "__main__":
    create_floating_widget()
