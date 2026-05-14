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
CHAT_URL = "https://chatbot.gabrielfarias-marques13.workers.dev/?desktop=true&v=premium_v3"

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

    class JSApi:
        def close_window(self):
            window.destroy()
            
        def extract_pdf_text(self, base64_data):
            """Lê o texto de um PDF em base64 localmente no desktop"""
            try:
                import base64
                import io
                from pypdf import PdfReader
                
                pdf_bytes = base64.b64decode(base64_data)
                pdf_file = io.BytesIO(pdf_bytes)
                
                reader = PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    content = page.extract_text()
                    if content:
                        text += content + "\n"
                
                return {"success": True, "text": text.strip()}
            except Exception as e:
                return {"success": False, "error": str(e)}

    api = JSApi()

    try:
        window = webview.create_window(
            'MedIA - Assistente Virtual', 
            CHAT_URL,
            width=400,
            height=540,
            resizable=True,
            on_top=True,
            js_api=api
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
        from PIL import Image, ImageTk, ImageDraw
        import numpy as np
        
        RENDER_SIZE = 256
        DISPLAY_SIZE = 72
        ICON_SCALE = 0.55
        
        # 1. Cria a base com o degradê pastel (estilo Glassmorphism)
        base = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
        draw = ImageDraw.Draw(base)
        
        # Cores Premium da MedIA (Mais vibrantes e nítidas)
        color_start = (0, 123, 143, 220)  # Teal Arthromed (com transparência)
        color_end = (233, 78, 119, 220)   # Pink Medic (com transparência)
        
        for i in range(RENDER_SIZE):
            t = i / RENDER_SIZE
            r = int(color_start[0] + (color_end[0] - color_start[0]) * t)
            g = int(color_start[1] + (color_end[1] - color_start[1]) * t)
            b = int(color_start[2] + (color_end[2] - color_start[2]) * t)
            a = int(color_start[3] + (color_end[3] - color_start[3]) * t)
            draw.line([(0, i), (RENDER_SIZE, i)], fill=(r, g, b, a))
            
        # 2. Máscara CIRCULAR com Borda de Cristal
        mask = Image.new("L", (RENDER_SIZE, RENDER_SIZE), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((8, 8, RENDER_SIZE-9, RENDER_SIZE-9), fill=255)
        
        final_img = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
        final_img.paste(base, (0, 0), mask)

        # Adicionar Anel Branco (Efeito de Vidro)
        draw_final = ImageDraw.Draw(final_img)
        draw_final.ellipse((8, 8, RENDER_SIZE-9, RENDER_SIZE-9), outline=(255, 255, 255, 100), width=6)
        
        # 3. Processa o Logo (Maior e mais nítido)
        ICON_SCALE = 0.50 # Ajustado para ficar elegante
        if os.path.exists(logo_path):
            logo = Image.open(logo_path).convert("RGBA")
            data = np.array(logo)
            red, green, blue, alpha = data.T
            white_areas = (red > 240) & (green > 240) & (blue > 240)
            data[..., 3][white_areas.T] = 0 
            logo = Image.fromarray(data)
            
            logo_w = int(RENDER_SIZE * ICON_SCALE)
            logo = logo.resize((logo_w, logo_w), Image.Resampling.LANCZOS)
            offset = (RENDER_SIZE - logo_w) // 2
            final_img.paste(logo, (offset, offset), logo)
            
        # 4. Redimensionamento
        img_final = final_img.resize((DISPLAY_SIZE, DISPLAY_SIZE), Image.Resampling.LANCZOS)
        
        # Garante bordas nítidas para o transparentcolor do Windows
        alpha = img_final.getchannel('A')
        binary_alpha = alpha.point(lambda p: 255 if p > 160 else 0)
        img_final.putalpha(binary_alpha)
        
        img = ImageTk.PhotoImage(img_final)
        
    except Exception as e:
        print(f"Erro ao criar ícone: {e}")
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


