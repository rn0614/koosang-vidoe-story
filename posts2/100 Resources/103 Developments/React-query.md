---
title: reactQuery
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: reactQuery, tanstack/Query를 위한 정리글
tags:
  - "#Front/React/Library"
  - "#React-Query"
date: 2024/09/20 00:00:00
last_modified_at: 2024/09/20 00:00:00
---
## 기능관련
`서버 상태 가져오기`, `캐싱`, `동기화 및 업데이트` 를 하는 react 전용 상태관리 라이브러리이다. (비동기 or 서버상태 작업에 특화)

## 개요
1. queryClient 에서 전역설정 및 캐싱데이터 관리
  0. 설치 및 Provider설정 / 전역설정 설정
  1. 전역 로딩설정
  2. 다음 사용자 행동을 예측해서 가져오기 `queryClient.prefetchQuery`
  3. 쿼리 수동 취소 `queryClient.cancelQueries
  4. 강제 refresh `queryClient.invalidateQueries`
  5. 기본타입 `<TQueryFnData, TError, TData, TQueryKey>`
2. useQuery로 데이터가져오기
  1. 기본조회 `useQuery`
  2. 조회간 순서가 보장돼야 하는 경우 `useQueries`
  3. 각각 다른 쿼리의 조회 결과 조합 `useQuery의 combine 속성`
3. useInfiniteQuery로 무한스크롤로 가져오기 
4. useMutation로 낙관적 변경

## 1. queryClient 에서 전역설정 및 캐싱데이터 관리
### 0 ) 설치 및 Provider설정 / 전역설정 설정
- 설치 / 이슈
```shell
# 현재 react-native webview 쪽에서 v5를 쓰면 에뮬레이터상 에러발생으로 v4로 진행(에뮬레이터 버전이 낮아서 발생)
npm i @tanstack/react-query@4.7.1
npm i @tanstack/react-query-devtools@4.7.1
```

- Provider 설정 / Error나 전역 설정위치
```tsx
//QueryClientProvider.tsx
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "react-toastify";

// custom Client
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      // useQuery의 기본 세팅  
      // 전역 에러설정
      onError: (error) => {
        toast.error("에러메세지");
      }
    },
    mutations: {
      // useMutation의 기본세팅
    },
  }
});

function CustomQueryClientProvider(){
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

### 1 ) 전역 로딩설정
```tsx
import { ReactElement } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import styles from "./Loading.module.scss";

export default function Loading(): ReactElement {
  const isFetching = useIsFetching();
  const isMutatuing = useIsMutating();

  const display = isFetching || isMutatuing ? "block" : "none";
  return (
    <div className={styles.wrapper} style={{ display: display }}>
      <svg className={styles.circlewrapper} viewBox="25 25 50 50">
        <circle className={styles.circle} r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  );
}
```

### 2 ) 다음 사용자 행동을 예측해서 가져오기
```tsx
const prefetchNextPosts = async (nextPage: number) => {
  const queryClient = useQueryClient();
  // 해당 쿼리의 결과는 일반 쿼리들처럼 캐싱 된다.
  await queryClient.prefetchQuery({
    queryKey: ["posts", nextPage],
    queryFn: () => fetchPosts(nextPage),
    // ...options
  });
};
```

### 3 ) 쿼리 수동 취소
```tsx
import {queryClient} from "@tanstack/react-query";

const queryClient = useQueryClient();

const onCancelHandler = (e)=>{
  queryClient.cancelQueries({queryKey:["query-key"]})
}

```

### 4 ) 강제 refresh
```tsx
import {queryClient} from "@tanstack/react-query";

const queryClient = useQueryClient();

const onCancelHandler = (e)=>{
  queryClient.invalidateQueries({ queryKey: ["super-heroes"] });  // 보통 useMutation과 같이 사용해서 사용자가 CUD 작업을 한 뒤 다시 조회
}

```

### 5 ) 기본타입
> useQuery, useMutation, useInfiniteQuery 모두 일반적으로 4개를 사용한다.
>`<TQueryFnData, TError, TData, TQueryKey>`
>backEnd에서 받은데이터, 받은 에러, 최종데이터, key배열 형태
>보통 select를 쓰지 않는다면 1,3번은 같기도 하고 queryFn에서 반환데이터 타입을 잘 정의하면 자동정의되므로 queryFn의 반환타입을 정의하자


## 2. useQuery로 데이터가져오기
### 1 ) 기본조회
```tsx
const getFn = async ():Promise<Response<any[]>> =>{
  return await fetch("http://"); 
};

const {
  data : data명칭,
  error,
  status,
  fetchStatus,
  isLoading,    // 기존의 캐시데이터 없음
  isFetching,   // 비동기함수 처리여부
  isError,
  refetch
} = useQuery({
  queryKey: ["queryKey1","queryKey2"],  // react-query가 관리하는 cache 데이터의 key값
  queryFn : getFn,                      // promise로 반환하는 fetch data
  
  //options
  select: (data) => (data가공), data를 가공해서 반환
  gcTime : 5 * 60 * 1000,
  staleTime : 1* 60 * 1000,
  retry : 1,
  enabled : true // 실행조건   *false 시 invalidateQueries, refetchQueries 도 무시   
  placeholderData: placeholderData,   // 초기 세팅 , v5에는 keepPreviousData이 없고 이를대체
  notifyOnChangeProps : ["data"] ,     // 특정 값 이상시 dependencies 같이 활동

  // polling 실행
  refetchInterval : 2000,
  refetchIntervalInBackground : true
})


// Defendent Queries 종속 순서에 상관이 있을 때

// 사전에 완료되어야 할 쿼리
const { data: user } = useQuery({
  queryKey: ["user", email],
  queryFn: () => getUserByEmail(email),
});

const channelId = user?.data.channelId;

// user 쿼리에 종속 쿼리
const { data: courses } = useQuery({
  queryKey: ["courses", channelId],
  queryFn: () => getCoursesByChannelId(channelId),
  enabled: !!channelId,
});

```

### 2 ) 조회간 순서가 보장돼야 하는 경우
> enabled 부분을 앞에 보장되어야하는 쿼리의 데이터 값으로 설정하여 앞 쿼리가 실행되지 않으면 불가하도록 변경
```tsx
// 사전에 완료되어야 할 쿼리
const { data: user } = useQuery({
  queryKey: ["user", email],
  queryFn: () => getUserByEmail(email),
});

const channelId = user?.data.channelId;

// user 쿼리에 종속 쿼리
const { data: courses } = useQuery({
  queryKey: ["courses", channelId],
  queryFn: () => getCoursesByChannelId(channelId),
  enabled: !!channelId,
});
```

### 3 ) 각각 다른 쿼리의 조회 결과 조합
```tsx
// paraeele
const queryResults = useQueries({
  queries:[
    {
      queryKey: ["queryKey",1],
      queryFn : ()=>queryFn
    },
    {
      queryKey: ["queryKey",2],
      queryFn : ()=>queryFn
    },
  ]
})

// 복수개의 쿼리 결과를 조합해서 추출
// front 단에서 데이터를 join해서 쓸 수 있다. (성능을 생각하면 back에서 하는게 맞다.)
const combinedQueries = useQueries({
  queries: [
    {queryKey:["userKey"], queryFn: () => fetchUser(id)},
    {queryKey:["postKey"], queryFn: () => fetchFost(id)}
  ]
  combine: (results) => {
    return ({
      data: results.map(result => result.data.map()),
      pending: results.some(result => result.isPending),
    })
  }
})
```

## 3. useInfiniteQuery로 무한스크롤로 가져오기 
```tsx
async function fetchSongs({ page, limit }: SearchParams) {
  const response = await fetch(`/api/songs?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch songs");
  }
  const data: Song[] = await response.json();
  return data || [];
}

function useInfiniteSongList({ limit }: any) {
  return useInfiniteQuery<Song[],Error>({
    queryKey: ["songs"],
    queryFn: ( {pageParam=1} ) => fetchSongs({ page:pageParam, limit }),
    //initialPageParam: 1, // v5에서 초기값 설정
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < limit ? undefined : allPages.length + 1;
    },
  });
}

```

## 4. useMutation로 낙관적 변경
```tsx
const { mutate, isLoading, isError, isSuccess, error } = useMutation({
  mutationFn: createTodo,
  onMutate() {
    /* ... */
  },
  onSuccess(data) {
    console.log(data);
  },
  onError(err) {
    console.log(err);
  },
  onSettled() {
    /* ... */
  },
});

mutate(data)

```



## Tip
> 보통 customHook 을 만들 때 recoil이랑 같이 사용하여 효율적인 전역변수 생성이 가능하다
```jsx
// useUser.js
import { useQuery } from '@tanstack/react-query';
import { useSetRecoilState } from 'recoil';
import { userState } from './recoilState';
import axios from 'axios';

const fetchUser = async () => {
  const response = await axios.get('/api/user'); // 예시 API 호출
  return response.data;
};

export const useUser = () => {
  const setUser = useSetRecoilState(userState);

  return useQuery({ 
    queryKey:['user'], 
    queryFn:fetchUser, 
    onSuccess: (data) => {
      setUser(data); // 성공 시 Recoil에 데이터 저장
    },
    onError: (error) => {
      console.error('Failed to fetch user:', error);
    },
  });
};


```