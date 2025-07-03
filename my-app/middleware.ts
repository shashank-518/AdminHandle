import { clerkMiddleware , clerkClient, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


const isPublicRoute = createRouteMatcher(  [
    "/",
    "/api/webhook/register",
    "/sign-up",
    "/sign-in"
])

export default clerkMiddleware(async (auth , request)=>{
    if (isPublicRoute(request)) {
    return NextResponse.next(); // Allow access to public routes
  }

  // Protect private routes
  const user = auth();

  if (!user) {
    // User not logged in, redirect to /sign-up
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }

  // If authenticated, allow access
  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}