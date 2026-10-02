import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Smart Asset Intelligence API',
    version: '0.1.0',
  });
}
