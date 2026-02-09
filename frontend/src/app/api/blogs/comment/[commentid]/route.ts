import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.BACKEND_URL || 'http://13.60.87.246:5002';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ commentid: string }> }
) {
    const params = await props.params;
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${API_URL}/api/v1/blogs/comment/${params.commentid}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader }),
        },
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
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}