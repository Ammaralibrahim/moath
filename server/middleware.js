// middleware.js
export const config = {
  matcher: '/api/:path*',
};

export default function middleware(request) {
  const origin = request.headers.get('origin');
  
  // Define allowed origins
  const allowedOrigins = ['https://alsawaf.vercel.app', 'http://localhost:3000'];
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // Handle preflight (OPTIONS) requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // Cache for 24 hours
      },
    });
  }

  // For actual requests, let them proceed. Headers will be added by your Express app.
  const response = new Response();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}