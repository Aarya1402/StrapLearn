import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(req: NextRequest) {
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const res = await fetch(`${STRAPI_URL}/api/notifications?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.url.split('/').pop();
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
