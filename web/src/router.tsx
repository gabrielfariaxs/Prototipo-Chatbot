import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Polyfill process.umask for edge/unenv runtimes (e.g. Cloudflare Workers)
if (typeof process !== 'undefined' && typeof process.umask !== 'function') {
  process.umask = () => 0o022
}


export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
