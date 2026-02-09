import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://13.60.87.246:5002';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
  try {
    const response = await fetch(
      `${API_URL}/api/v1/blogs/${params.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}