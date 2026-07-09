import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

// Polyfill process.umask for edge/unenv runtimes (e.g. Cloudflare Workers)
if (typeof process !== 'undefined' && typeof process.umask !== 'function') {
  process.umask = () => 0o022
}


import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
      },
      {
        title: 'MedIA - Arthromed',
      },
      {
        name: 'theme-color',
        content: '#1a2332',
      },
      {
        httpEquiv: 'Cache-Control',
        content: 'no-cache, no-store, must-revalidate',
      },
      {
        httpEquiv: 'Pragma',
        content: 'no-cache',
      },
      {
        httpEquiv: 'Expires',
        content: '0',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/logo.png',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo.png',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center font-sans">
        <h1 className="text-4xl font-extrabold text-[#1a2332] mb-4">Página Não Encontrada</h1>
        <p className="text-slate-500 mb-6 max-w-sm">A página que você está tentando acessar não existe ou foi movida.</p>
        <a href="/" className="bg-[#1a2332] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-[#253043] transition-all">
          Voltar ao Início
        </a>
      </div>
    )
  }
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
