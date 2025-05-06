---
title: Fetch와 axios
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: FE 에서 api 사용을 위한 라이브러리
thumnail: 
tags:
  - Front/React/Library
  - API
date: 2025/03/01 12:24:38
last_modified_at: 2025/03/18 21:59:26
---
## 개요
현재 많은 프로젝트에서는 axios를 쓰고 fetch는 nextjs에서 쓰는 경우가 대부분이다.
일반적인 fetch와 nextjs의 fetch는 다른 fetch이다. nextjs 에서는 fetch를 decorate해서 앞뒤로 추가적인 처리가 있다.

## 내 결론
Nextjs => fetch사용 , 그외 => axios사용

## 비교 표 
axios의 캐싱과 중복요청은 react-query로 사용하고 
Nextjs의 요청, 응답 인터셉터는 middelware와 BFF 구조로 해결한다.(요청은 middleware, 응답은 서버 fetching에서 BFF에서 처리)

| 기능                                   | 내장 `fetch`                | `axios`                             | Next.js `fetch`                        |
| ------------------------------------ | ------------------------- | ----------------------------------- | -------------------------------------- |
| **기본 제공 여부**                         | ✅ 브라우저 내장 API             | ❌ 외부 라이브러리 필요 (`npm install axios`) | ✅ Next.js 내장 (`global.fetch`)          |
| **JSON 자동 변환**                       | ❌ `response.json()` 호출 필요 | ✅ 자동 변환 (`response.data`)           | ❌ `response.json()` 필요 (기본 `fetch` 기반) |
| **요청 & 응답 인터셉터**                     | ❌ 직접 구현 필요                | ✅ `axios.interceptors` 제공           | ❌ 직접 구현 필요, (middleware,router에서 보완가능) |
| **에러 핸들링**                           | ❌ `response.ok` 체크 필요     | ✅ HTTP 오류 시 자동 reject               | ✅ Next.js 내부에서 에러 추적 가능                |
| **타임아웃 설정**                          | ❌ `AbortController` 필요    | ✅ `timeout` 옵션 제공                   | ❌ `AbortController` 필요                 |
| **요청 취소 기능**                         | ✅ `AbortController` 사용    | ✅ `CancelToken` 사용                  | ✅ `AbortController` 사용 가능              |
| **캐싱 (자동 캐싱)**                       | ❌ 기본적으로 없음                | ❌ 없음, (react-query로 보완가능)           | ✅ `next: { revalidate: N }` 지원         |
| **중복 요청 방지**                         | ❌ 없음                      | ❌ 없음, (react-query로 보완가능)           | ✅ 자동으로 동일 요청 합침                        |
| **React Server Components (RSC) 지원** | ❌ 클라이언트에서만 실행             | ❌ 클라이언트에서 실행됨                       | ✅ 서버에서 실행됨 (브라우저 요청 없음)                |
| **서버 실행 지원 (SSR, API Routes)**       | ❌ `node-fetch` 필요         | ✅ Node.js 지원                        | ✅ 기본적으로 지원                             |
| **URL 상대 경로 지원**                     | ❌ 절대 경로 필요                | ❌ 절대 경로 필요                          | ✅ 상대 경로 지원 (`/api/...`)                |
| **Node.js 스트리밍 지원**                  | ❌ 전체 응답 받아야 함             | ❌ 지원 안 함                            | ✅ `res.body`로 스트리밍 가능                  |


### 일반적인 데이터 전송형태
1. application/x-www-form-urlencoeded : url의 queryString에 데이터가 들어가는 방식 / 단순한 데이터를 보낼때 사용하고. 보통 로그인, 검색등에서 사용.
2. application/json : RestApi에서 자주 사용되고 가독성이 좋고 복잡한 구조도 쉽게 전송, backend에서도 json으로 처리가능
3. multipart/form-data: 파일형태의 데이터를 전달할 때 사용

## 코드
### JSON 자동변환에 의한 코드 차이
일반적으로 response 의 클래스 형태가 조금 차이가 나는데 내장객체 Response의 json 메서드를 통해 data를 추출해서 사용한다.
axios를 사용하면 response.data 위치에 Response객체의 data가 들어가 있음. 따라서 response 자체로 처리하게 된다.
```js
// fetch데이터 추출과정
fetch('/api/data') 
  .then(response => response.json()) // JSON 변환 필요 
  .then(data => console.log(data)) 
  .catch(error => console.error('Error:', error));

axios.get('/api/data')
  .then(response => console.log(response.data)) // JSON 자동 변환
  .catch(error => console.error('Error:', error));
```


### method와 header 처리
```js
// ✅ Fetch
fetch('https://jsonplaceholder.typicode.com/todos/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_ACCESS_TOKEN'
  }
})
  .then(response => response.json())
  .then(data => console.log(data));


// ✅ Axios
import axios from 'axios';

// axios는 모듈 자체에서 설정
axios.get('https://jsonplaceholder.typicode.com/todos/1', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_ACCESS_TOKEN'
  }
})
  .then(response => console.log(response.data));
```




### 요청, 응답 interceptor에 변경을 axios
> 일반적으로 요청을 보낼 때 content-type을 설정 및 인증, 인가를 위해 header설정 및 초기 hearder를 설정하기도 하고 다른 전처리를 해야하는데 이때 인터셉터 기능을 이용하면 편한 설정이 가능하다.

```js
// axios 코드
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

//  util.ts
// 📌 쿠키에서 특정 키 값을 가져오는 함수,
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(row => row.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null; 
}

// Axios 공통설정
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000, // 5초 타임아웃 설정
  headers: { 'Content-Type': 'application/json' }
});

// 📌 요청 인터셉터 (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    const token = getCookie('token')
    // Authorization 헤더 추가 가능
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('요청 오류:', error);
    return Promise.reject(error);
  }
);

// 📌 응답 인터셉터 (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    console.log(`[응답] ${response.status} ${response.config.url}`);
    return response.data; // `response.data`만 반환해서 사용 편의성 증가
  },
  (error) => {
    console.error('응답 오류:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ✅ 사용 예제
async function fetchData() {
  try {
    const data = await api.get('/todos/1');
    console.log('📌 API 응답 데이터:', data);
  } catch (error) {
    console.error('🚨 요청 실패:', error);
  }
}

fetchData();

```


### 기본 axios 설정
> header 관련 설정 및 
```js
import axios from 'axios';

// ✅ 쿠키에서 JWT 토큰 가져오는 함수
function getToken() {
  return document.cookie.split('; ')
    .find(row => row.startsWith('token='))?.split('=')[1] || null;
}

// ✅ Axios 인스턴스 생성
const api = axios.create({
  baseURL: 'https://example.com/api'
});

// ✅ 요청 인터셉터 설정
api.interceptors.request.use((config) => {
  const token = getToken(); // 쿠키에서 토큰 가져오기

  // 🔥 JWT 토큰이 존재할 때만 Authorization 헤더 추가
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Content-Type이 없으면 기본값 적용
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

  return config;
}, (error) => Promise.reject(error));

// ✅ 사용 예제 (로그인한 경우만 Authorization 헤더 포함)
api.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' } // 기존 Authorization 유지됨
})
.then(response => console.log(response.data))
.catch(error => console.error('🚨 요청 실패:', error));

```