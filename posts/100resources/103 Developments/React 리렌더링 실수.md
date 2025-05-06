---
title: React Rerendering 실수
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: UseEffect의 사용으로 인한 과한 리렌더링 과정에서 발생하는 문제 해결과정
tags:
  - Front/React
  - 문제해결
date: 2024/10/11 00:00:00
last_modified_at: 2024/10/11 00:00:00
---
## 실수 코드
아래코드로 클라이언트가 리액트 네이티브인지 확인했다.
```tsx
const [isMobile, setIsMobile] = useState(false);
useEffect(() => { 
  if (typeof window !== "undefined") { 
    setIsMobile(!!window?.ReactNativeWebView); 
  } 
}, []);

```


## 원인
1. useEffect에 들어온 시점에서 typeof window는 무조건 "undefined"가 아니다. 따라서 확인하는 작업은 필요없다.
2. useState를 false로 해놔서 만약 Mobile환경(react-native의 webview환경)일 경우 해당 값이 true로 바뀌면서 전체 코드가 리렌더링되는 문제가 발생하였다.

## 해결
Header 부분에서 전체 Header를 표기할지 여부를 따로 wrapper로 만들어 client Component로 만들어야한다. 그래서 초기 mount 할 때 window 값을 클라이언트로부터 가져와 어떤 값인지 확인하고 사용하도록 해야한다.

*참고 : Header에는 로그인 여부등 server에서부터 가져오는 요소들도 있다 따라서 보여주는지 여부만 따로 빼야한다.* #추가작성필요 
```tsx
const isMobileRef = useRef(typeof window !== "undefined" && !!window.ReactNativeWebView);


return (
  <>
    {isMobileRef.current && (<div>div</div>)}
  </>
)
```