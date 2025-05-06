---
title: Meta Tag
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: html 문서 설명을 위한 메타데이터 항목 설명
tags:
  - Front/React
  - SEO
permalink: /categories2/202411032254Tag/
date: 2024/11/03 00:00:00
last_modified_at: 2024/11/03 00:00:00
---
## 기본 메타태그들
- title:
- description
- keywords
- robots
- viewport
- charSet
- openGraph : []
- article : []


## SEO 관련
> 기본적으로 검색엔진들은 title, description, keywords 
```html
// 기본적으로 검색어가 content에 있을 때 효과적으로 노출하기 위한 설정
<meta name="title" content="페이지 제목">
<meta name="description" content="페이지 설명">
<meta name="keywords" content="HTML,CSS,JavaScript,웹개발,SEO최적화">
```


## 미리보기 관련
### Open Graph
> 메타에서 적용한 미리보기 관련 태그들, 설정하면 더 좋은 미리보기를 보여준다
> 이미 적용된 seo를 더 강화하는 역할을 함.
```html
<head>
  <meta property="og:title" content="웹사이트 제목">
  <meta property="og:description" content="설명">
  <meta property="og:image" content="https://koosang-project.com/img.jpg">
  <meta property="og:url" content="https://koosang-project.com">
  <meta property="og:type" content="website">
</head>


```
### Twitter Cards
```html
<head>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="나의 멋진 페이지 제목">
  <meta name="twitter:description" content="이 페이지는 흥미로운 정보를 제공합니다.">
  <meta name="twitter:image" content="https://example.com/large-image.jpg">
  <meta name="twitter:site" content="@yourusername">
</head>

```

### Webview 앱을 위한 크기조정 설정

```html
//스케일을 강제하고 zoom-in, zoom-out을 불가능하도록 변경
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```


```tsx
//Nextjs에서의 소스 
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}
```

### IE Edge 설정
```html
<meta http-equiv="X-UA-Compatible" content="IE=edge"> // IE, EDGE 사용자 최신으로 사용하기
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> // 문자 인코딩, 한글을 위한 UTF-8
<link rel="icon" href="favicon.ico" type="image/x-icon"> // 패비콘 설정
```


### 기타 메타 태그
```html
<meta name="copyright" content="Copyright 구상모">  //저작권자 명시
<meta http-equiv="refresh" content="5000; url=https://https://refreshpage.com"> // 특정시간(5000초) 이후에 이동시키는 작업
```