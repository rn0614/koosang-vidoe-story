'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { convertBlobUrlToFile } from '@/utils/convert-utils';
import { uploadImage } from '@/utils/supabase/storage/client';

export default function TestPage() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return;

    const files = Array.from(e.target.files ?? []);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));

    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const [isPending, startTransition] = useTransition();

  const handleUploadClick = async () => {
    startTransition(async () => {
      let urls = [];
      for (const url of imageUrls) {
        const imageFile = await convertBlobUrlToFile(url);
        const { imageUrl, error } = await uploadImage({
          file: imageFile,
          bucket: 'ai-image',
        });

        if (error) {
          console.error(error);
          return;
        }
        urls.push(imageUrl);

        // 예시: title, description, tags는 임시값(실제 입력값으로 대체)
        const title = imageFile.name;
        const description = '';
        const tags:any[] = [];

        await fetch('/api/ai-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            tags,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
      setImageUrls([]);
    });
  };

  // 이미지 제거 함수
  const handleRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((item) => item !== url));
  };

  return (
    <div>
      <input
        type="file"
        hidden
        multiple
        ref={imageInputRef}
        onChange={handleChange}
        disabled={isPending}
      />
      <button onClick={() => imageInputRef.current?.click()}>
        select image
      </button>

      <div className="flex flex-wrap gap-2 mt-4">
        {imageUrls.map((url, index) => (
          <div key={url} className="relative group inline-block">
            <Image
              src={url}
              alt={`image-${index}`}
              width={100}
              height={100}
              className="rounded"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(url)}
              className="absolute right-1 top-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
              style={{ zIndex: 10 }}
              aria-label="이미지 삭제"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleUploadClick} disabled={isPending}>
        {isPending ? <p>uploading...</p> : 'upload'}
      </button>
    </div>
  );
}
