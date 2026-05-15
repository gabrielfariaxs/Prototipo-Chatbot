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
            """Lê o texto de um PDF em base64. Se for imagem, renderiza para o MedIA ver."""
            try:
                import base64
                import io
                # Garante que as dependências de texto estejam presentes
                try:
                    from pypdf import PdfReader
                except ImportError:
                    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
                    from pypdf import PdfReader
                
                # Garante que as dependências de imagem estejam presentes
                try:
                    import fitz # PyMuPDF
                except ImportError:
                    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymupdf"])
                    import fitz

                pdf_bytes = base64.b64decode(base64_data)
                pdf_file = io.BytesIO(pdf_bytes)
                
                # 1. Tenta extrair texto normal
                reader = PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    content = page.extract_text()
                    if content:
                        text += content + "\n"
                
                text = text.strip()

                # 2. Se não tem texto (PDF Escaneado), renderiza a primeira página como imagem
                if not text:
                    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                    if len(doc) > 0:
                        page = doc[0]
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Alta qualidade
                        img_data = pix.tobytes("png")
                        img_b64 = base64.b64encode(img_data).decode('utf-8')
                        doc.close()
                        return {"success": True, "text": "", "image": img_b64, "mimeType": "image/png"}
                
                return {"success": True, "text": text}
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
    
    logo_path = os.path.join("web", "public", "logo_new.png")
    
    try:
        from PIL import Image, ImageTk, ImageDraw
        import numpy as np
        
        RENDER_SIZE = 256
        DISPLAY_SIZE = 72
        # 1. Cores e Definições da Nova Identidade
        bg_color = (26, 28, 35, 255)  # Dark Blue/Black da nova identidade
        ICON_SCALE = 0.50
        
        # 2. Cria a base com o fundo escuro e bordas arredondadas
        final_img = Image.new("RGBA", (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))
        draw = ImageDraw.Draw(final_img)
        
        # Desenha o quadrado arredondado (estilo iOS/Premium)
        radius = 50
        draw.rounded_rectangle((8, 8, RENDER_SIZE-9, RENDER_SIZE-9), radius=radius, fill=bg_color)
        
        # 3. Processa o novo Logo
        if os.path.exists(logo_path):
            logo = Image.open(logo_path).convert("RGBA")
            
            # Garante que o ícone fique branco se não for (opcional, mas bom para garantir)
            data = np.array(logo)
            # Se o ícone já for branco, isso apenas reforça
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
    
    # Menu de contexto (Botão Direito) para fechar
    menu = tk.Menu(root, tearoff=0)
    menu.add_command(label="Fechar MedIA", command=root.destroy)

    def show_menu(event):
        menu.post(event.x_root, event.y_root)

    lbl.bind("<Button-3>", show_menu)
    
    print("Widget MedIA iniciado!")
    root.mainloop()

if __name__ == "__main__":
    if "--window" in sys.argv:
        run_as_window()
    else:
        create_floating_widget()


