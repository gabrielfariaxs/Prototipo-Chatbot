// MedIA Extension - Content Script
(function() {
  if (window.hasMedIAExtension) return;
  window.hasMedIAExtension = true;

  console.log('MedIA Extension: Carregando...');

  const container = document.createElement('div');
  container.id = 'media-extension-root';
  
  // Criar o iframe que aponta para a nossa aplicação web
  const iframe = document.createElement('iframe');
  
  // No desenvolvimento, apontamos para localhost. No deploy, mudar para a URL do Cloudflare.
  iframe.src = 'http://localhost:3000/?extension=true'; 
  
  iframe.id = 'media-chat-iframe';
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'border:none !important; width:100% !important; height:100% !important; background:transparent !important; color-scheme: light !important;';
  iframe.allow = 'microphone; clipboard-read; clipboard-write';

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Escutar mensagens do iframe para redimensionar o container
  window.addEventListener('message', (event) => {
    // Verificar se a mensagem é nossa
    if (event.data.type === 'MEDIA_CHAT_TOGGLE') {
      if (event.data.isOpen) {
        container.classList.add('is-open');
      } else {
        container.classList.remove('is-open');
      }
    }
  });
})();
