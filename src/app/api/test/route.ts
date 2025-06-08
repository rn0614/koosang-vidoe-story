import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('here request');
  const request = await req.json();
  console.log('request', request);
  return NextResponse.json({});
}
