"use server"
import { headers } from 'next/headers';

export async function detectPlatform(): Promise<'mobile' | 'web'> {
  const userAgent = (await headers()).get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  return isMobile ? 'mobile' : 'web';
} 