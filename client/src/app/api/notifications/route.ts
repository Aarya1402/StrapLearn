import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/axios';

export async function GET(req: NextRequest) {
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const res = await api.get(`/notifications?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(error.response?.data || { error: 'Failed to fetch notifications' }, { status: error.response?.status || 500 });
  }
}

export async function PUT(req: NextRequest) {
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.url.split('/').pop();
  const body = await req.json();

  try {
    const res = await api.put(`/notifications/${id}`, body, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(error.response?.data || { error: 'Failed to update notification' }, { status: error.response?.status || 500 });
  }
}
