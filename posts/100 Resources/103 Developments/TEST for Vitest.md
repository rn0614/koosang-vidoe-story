---
title: TEST for Vitest
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: test-for-vitest
thumnail: 
tags:
  - Front/React
  - Front/React/Library
  - test
date: 2025/03/03 11:55:36
last_modified_at: 2025/03/18 21:13:23
---
## 개요
> create-react-app 이 지원을 중단하고 많은 개발자들이 빌드도구로서 vite를 사용하게 돼었다. 가볍기도 하고 간단하다. 이 vite의 테스트 도구로서 vitest가 있다. 이 vitest와 jest 의 차이점 및 vite의 사용법을 알아보자


## Jest vs Vitest
### Jest
장점 : jest의 가장 큰 장점은 생태계이다. 전통적으로 오래 사용돼 왔고 TDD가 도입되고 프론트엔드까지 테스트코드를 본격적으로 짜는 것은 오래되지 않았다. 그만큼 리소스가 없는 편인데 그나마 오랜기간 사용됐던 jest의 생태계는 무시할 수 없다.

단점 : 테스팅 속도가 느리다. 

### Vitest
장점 : vite 환경에서 최적화돼서 사용이 가능하다.

단점 : 생태계 부족


## 개인의견
많은 React개발자들이 Nextjs로 넘어가면서 React단독으로 개발하는 경우는 점점 줄어들고 있다. 하지만 Nextjs 는 빌드 과정에서 돌아가는 개발자가 모르는 무수한 코드들에 의해서 무거워진다는 단점이 있다. 그리고 기반자체가 React이기 때문에 React를 잘하는 사람이 결국 Nextjs도 잘 사용할 수 있다고 본다.

## 세팅코드
### vite-env.d.ts
vitest에서 gloabals로 쓸 타입들을 미리 선언하자
```d.ts
/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
```


### vitest.config.js
기본적인 실행환경에대한 설정이다. vite의 경우 defineConfig 로 감싸면 설정이 가능하다. 
버전이 바뀌면서 mergeConfig가 Object 객체만 받게 됐다 . 즉 viteConfig는 못받고 객체로 만들어진 viteConfig(configEnv) 상태로 받아야한다. 
해당 설정이 justand에서 과거버전으로 되어 있어서 확인하는데 좀 걸렸다.
```js
// vitest.config.js
import { defineConfig, mergeConfig } from "vite";
import viteConfig from "./vite.config";
export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        environment: "jsdom", // JSDOM 환경 설정
        setupFiles: "./src/vitest.setup.tsx", // setup 파일 추가
        globals: true, // 글로벌 expect 허용
      },
    })
  )
);

```


### vitest.setup.tsx
셋업과정에서 사용하는 코드이다. 

Mui를 사용하는데 MatchMedia를 통해 다크모드를 구현했으므로 이것도 사전에mocking 했다. 
```tsx
import { cleanup } from "@testing-library/react";
import '@testing-library/jest-dom'

// window.matchMedia Mocking (전역 적용)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // 기본적으로 다크 모드 비활성화
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// __mocks__ 에 설정한 zustand로 mocking을 하기 위한 설정
vi.mock('zustand')

// 각 테스트 후 cleanup 실행 (메모리 누수 방지)
afterEach(() => {
  cleanup();
});

```

### test-utils.tsx
단순히 component만 불러왔을 때 내부에있는 react-router-dom, react-query, Theme 등 사전에 정보를 줘야할 프로바이더들이 없으면 동작하지 않는다. 이를 전달하기 위해 사전에 TestProvider를 만들어 미리 Layout을 정의한다.

***단 이렇게 Provider나 layout이 덕지덕지 붙은건 rendering하는 속도가 느리기 때문에 테스트코드 실행속도를 저하시킨다 따라서 테스트코드를 작성할때 해당 레이아웃을 따로 불러오는것이 아닌 하나의 테스트코드에서 한번만 불러오도록 선언해야한다.***
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";
import ThemeLayout from "./components/ThemeLayout"; // ThemeLayout 경로 확인
import { render } from "@testing-library/react";

// 테스트용 QueryClient 생성
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 테스트 중 자동 재시도 방지
      },
    },
  });

function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeLayout>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeLayout>
    </QueryClientProvider>
  );
}

function customRender(ui: React.ReactNode) {
  return render(ui, { wrapper: TestProviders });
}

export { TestProviders, customRender };
```


