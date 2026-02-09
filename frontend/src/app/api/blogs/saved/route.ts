import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://13.60.87.246:5002';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_URL}/api/v1/blogs/saved`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader }),
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error (GET /api/blogs/saved):', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved blogs' },
      { status: 500 }
    );
  }
}