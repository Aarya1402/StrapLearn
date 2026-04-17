import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const res = await fetch(`${STRAPI_URL}/api/notifications/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
