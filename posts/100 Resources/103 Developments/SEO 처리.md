---
title: SEO 처리
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: SEO를 통해 검색엔진에 더 노출될 수 있도록 조정하는 방법
tags:
  - SEO
  - MARKETING
date: 2024/11/03 00:00:00
last_modified_at: 2024/11/03 00:00:00
---
## SEO란?
> 검색엔진 최적화
> 대형 검색사이트에서 내가 만든 사이트를 검색하기 쉽게 만들어 노출하기 위한 디지털 마케팅 작업

## 방식
1. siteMap : 검색엔진이 사이트 구조를 이해하고 페이지를 인덱싱하도록 돕는 xml파일
2. robots : 검색엔진이 크롤링할 수 있는 페이지를 지정하는 파일
3. metadata: 레이아웃 페이지별로 저장하는 metadata

## 방식 추가 설명

### robot.txt
1. 불필요한 크롤링을 방지한다.
=> 비공개 페이지, 중요치 않은 페이지의 검색엔진 크롤링을 막음
```
User-agent: *
Disallow: /admin/
Disallow: /api/
```

2. 서버부하 감소
=> 크롤러가 불필요한 페이지 크롤링을 막음으로서 서버리소스 절약
3. 중복 콘텐츠 방지
=> 동일 콘텐츠 포함하는 페이지는 크롤러에 입력시 seo 패널티를 받을 수 있음. 해당 부분 방지
4. 중요페이지 우선순위 지시
5. sitemap 위치 제공

### sitemap.xml
1. 색인화 진행
2. 새로운 컨텐츠의 빠른 반영
3. 사이트 구조 명시

## 코드

### .env.local
```
# Nextjs 실 서비스 url
NEXT_P_BASE_URL=https://koo-sang-threejs.vercel.app
```

```ts
import { Song } from "@/types/types";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_P_BASE_URL

  const response = await fetch(`${baseUrl}/api/songs?page=${1}&limit=${10000}`);

  const data: Song[] = await response.json();

  const songPages = data?.map((song)=>{
    return {
      url: `${baseUrl}/music/detail/${song?.id}`,
      latestModified: new Date()
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...songPages
  ]
}
```


### robots.ts
```ts
import { MetadataRoute } from "next";
import { userAgent } from "next/server";

export default function robots(): MetadataRoute.Robots{
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/music"],
      disallow:[]
    },
    sitemap:`${process.env.NEXT_PUBLIC_API_BASE_URL}/sitemap.xml`
  }
}
```

### layout.ts
> 정적 default seo
```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL!),
  keywords:["front-end","portfolio","구상모","koosang","KooSang-project"],
  title: {
    default:"KooSang-project",
    template: `%s | KooSang-project`
  },
  description: "side project for KooSang",
  openGraph:{
    description: "구상모의 놀이터입니다. 배운기술을 연마하고 사용하기 위한 사이트 입니다.",
    images:['']
  }
};
```

### `[id].ts`
> 동적 page의 seo
```ts
export async function generageMetadata({params}:PageProps){
  try{
    const song = await fetchSongById(params.musicId);
    return {
      openGraph:{
        title: song.title,
        description: song.description,
        images:[song?.image?.[0]]
      }
    }
  }catch(e){
    return {
      title: "Not Found",
      description:"The page is not exist"
    }
  }
}
```

