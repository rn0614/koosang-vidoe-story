---
title: MSW + Jest + Nextjs 설정
CMDS:
- "[[107 Project]]"
excerpt: MSW + Jest + Nextjs 설정 과정 공유
tags: 
date: 2024/10/01 00:00:00
last_modified_at: 2024/10/01 00:00:00
---
## 무엇을 해결했나?
1. dev 모드에서 mocking한 데이터 출력
2. npm run test로 `__test__` 하위 테스트파일들 테스트 진행

## 개요
> 개발환경에서 테스트는 매우 중요하다. 특히 내가 겪었던 오류사항에 대해서 테스트를 적어 다른사람이 같은 실수를 하는 것을 방지 및 코드의 위험성을 낮춰 개발속도를 빠르게 개선할 수 있다. NEXTJS + MSW + JEST 환경에서 테스트 및 개발계의 사용성을 증진시키는 것을 목적으로 작업했다.


## 설정과정
### 1. JEST 설치 및 MSW 설치
#### 설치 라이브러리
> 기본적으로 testing-library 부분은 user-event만 추가, 
> jest-environment-jsdom, jest-fixed-jsdom,msw, ts-jest 4개의 라이브러리는 설치해준다.
```json
  "devDependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",    
    "@types/jest": "^29.5.12",
    "jest-environment-jsdom": "^29.7.0",
    "jest-fixed-jsdom": "^0.0.3",
    "msw": "^2.4.3",
    "ts-jest": "^29.2.5
  }
```

* msw 는 1과 2 버전이 있는데 2도 이제 많이 안정화됐고 레퍼런스도 쌓여서 과감히 2로 진행하였다
### 2. public 폴더에 mockServiceWorker 추가
```shell
npx msw init public/ --save
```

#추가작성필요 