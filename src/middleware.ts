// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. - John 3:16 (KJV)
import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

let locales = ['en', 'es'];
export let defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore languages are readonly (this is a known workaround for Negotiator)
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch (e) {
    // Handle "No locale data has been provided for this object yet."
    // This can happen if intl-localematcher is not properly initialized or languages array is empty/invalid.
    console.warn("Error matching locale in middleware, defaulting to:", defaultLocale, e);
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith('/' + locale + '/') && pathname !== '/' + locale
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en/products or /es/products
    return NextResponse.redirect(
      new URL(
        \`/\${locale}\${pathname.startsWith('/') ? '' : '/'}\${pathname}\`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring paths starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - assets (your static assets folder)
  // - favicon.ico (favicon file)
  // - sw.js (service worker file)
  // - manifest.json (PWA manifest)
  // - robots.txt (robots file)
  // - sitemap.xml (sitemap file)
  // - any file with an extension (e.g., .png, .jpg, .svg)
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|.*\\..*).*)'
  ],
};
