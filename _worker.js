/**
 * Cloudflare Pages Edge Worker
 * Intercepts protected test routes.
 * Validates 'ias_session_token=true' cookie set by auth.js.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // Define protected directories and files
    const isProtected = 
      pathname.startsWith('/tests/paid/') || 
      pathname.includes('/pro-') ||
      pathname.startsWith('/paid/');

    if (isProtected) {
      const cookieHeader = request.headers.get('Cookie') || '';
      const hasValidSession = cookieHeader.includes('ias_session_token=true');

      if (!hasValidSession) {
        // Redirect directly to landing page with paywall query param
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('unauthorized', '1');
        return Response.redirect(redirectUrl.toString(), 302);
      }
    }

    // Serve all static assets and free tests normally
    return env.ASSETS.fetch(request);
  }
};