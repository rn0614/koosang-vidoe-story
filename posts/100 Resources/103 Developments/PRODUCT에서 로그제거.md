---
title: PRODUCT 에서 로그제거
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 프론트엔드 환경에서 콘솔을 찍고 확인할 수 있다.
tags:
  - Front/React
  - log
date: 2025/01/30 00:00:00
last_modified_at: 2025/01/30 00:00:00
isPosting: true
---
## 프론트의 console.log
> 개발을 위해서는 우리는 로거를 찍거나 debugger로 디버깅을 한다.
> 이전에 같은 부분을 분석했다면 같은 로그가 찍혀있는 부분까지만 확인하면 좋다.
> 하지만 운영단계에서 해당부분에서 logging이 남아있으면 보안에 취약하기도 하고 사용자에게 개발자의 소스가 노출될 수 있다.
> 이부분은 설정에서 날려야한다.

실제 사용할 때마다 console.log를 주석으로 바꿀 필요없이 nextjs 에서는 간단한 설정으로 compiler에서 console.log를 바꿀 수 있다.
 
 문제는 이렇게 찍어놓은 log는 실제로 운영환경에서는 보안, 과한정보를 사용자에게 제공할 뿐더러 해킹하는 사람에게 내부 소스까지 공개하는 역할을 한다. 따라서 빌드시점에서는 없애야한다.

Nextjs에서는 config 설정으로 이걸 없앨 수 있다.
실제 prod 환경에서는 error와 warn을 제외한 나머지 console을 날려버리자
```js
/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: "export",
  compiler: {
    removeConsole:
      process.env.API_DOC_ENV === "prod"
        ? { exclude: ["error", "warn"] }
        : null,
  },
};

module.exports = nextConfig;


```
