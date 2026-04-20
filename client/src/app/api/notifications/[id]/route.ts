import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/axios';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jwt = req.cookies.get('strapi_jwt')?.value;
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
