import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
import {routing} from './i18n/routing';

export async function middleware(request: NextRequest) {
  console.log('middleware1',request.nextUrl.pathname);
  await updateSession(request);

  // 국제화 라우팅 제외, middleware 는 적용해야하면서 국제화 라우팅 제외
  if (
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/assets')
  ) {
    return createMiddleware(routing)(request);
  }
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     * - api
     * - sitemap.xml
     * - robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb)$).*)',
  ],
};
