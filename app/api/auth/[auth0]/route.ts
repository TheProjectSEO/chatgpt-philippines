import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

// Handle all Auth0 routes (login, logout, callback, profile)
export async function GET(req: NextRequest) {
  return auth0.middleware(req);
}

export async function POST(req: NextRequest) {
  return auth0.middleware(req);
}
