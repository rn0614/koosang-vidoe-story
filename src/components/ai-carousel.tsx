import { createClient } from '@/utils/supabase/server';
import { CarouselDemo } from './mobile-carousel';
import { Card, CardContent, CardTitle } from './ui/card';
import { CardHeader } from './ui/card';

export async function AiCarousel() {
  // Supabase에서 최근 8개 이미지 가져오기
  const supabase = await createClient();
  const { data: imagesData, error } = await supabase
    .from('ai_image')
    .select('image_url, title, description')
    .order('created_at', { ascending: false })
    .limit(8);

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
