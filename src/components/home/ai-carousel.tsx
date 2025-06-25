import { createClient } from '@/utils/supabase/server';
import { CarouselDemo } from '../widget/mobile-carousel';
import { Card, CardContent, CardTitle } from '../ui/card';
import { CardHeader } from '../ui/card';

export async function AiCarousel() {
  // Supabase에서 최근 8개 이미지 가져오기
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-image`);
  const data = await res.json();

  // imagesData가 [{ image_url, title, description }, ...] 형태
  const images =
    data?.imagesData?.map((img: any) => ({
      src: img.image_url,
      title: img.title,
      description: img.description,
    })) ?? [];
  return (
    <>
      <div className="text-2xl font-semibold leading-none tracking-tight pb-4">
        생성 AI이미지
      </div>
      <CarouselDemo images={images} />
    </>
  );
}


/*
// 클라이언트 컴포넌트(이미지요소의 경우 csr의 경우 너무 로딩 지연으로 ssr로 url 가져오기)
"use client";
import { CarouselDemo } from './mobile-carousel';
import { useAIImage } from '@/hooks/useAIImage';
export function AiCarousel() {
  // Supabase에서 최근 8개 이미지 가져오기
  const {
    images: imagesData,
    count,
  } = useAIImage();

  // imagesData가 [{ image_url, title, description }, ...] 형태
  const images =
    imagesData?.map((img) => ({
      src: img.image_url,
      title: img.title,
      description: img.description,
    })) ?? [];
  return (
    <>
      <div className="text-2xl font-semibold leading-none tracking-tight pb-4">
        생성 AI이미지
      </div>
      <CarouselDemo images={images} />
    </>
  );
}
*/