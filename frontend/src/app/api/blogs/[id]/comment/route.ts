import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://13.60.87.246:5002';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_URL}/api/v1/blogs/${params.id}/comment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader }),
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}