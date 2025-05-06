---
title: React-Native 내장객체
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 내장 객체
tags:
  - 모바일/react-native
date: 2024/09/25 00:00:00
last_modified_at: 2024/09/25 00:00:00
---
## ScrollView 와 RefreshControl
## 무엇을 해결했나?
> 웹뷰상태에서 위에서 아래로 드래그 시 화면 새로고침 기능 추가

## 코드
### 화면코드
```tsx
// 화면

const webViewRef = useRef<WebView>(null);    // 웹뷰를 여기다 ref설정했는데 다른곳에서 ref를 쓴다면 밖으로 빼는게 좋을 것 같음.
const { refreshing, onRefresh } = useScrollRefresh(webViewRef); // 커스텀 훅 사용

<ScrollView
  contentContainerStyle={{ flex: 1 }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  <WebView
    ref={webViewRef}
  />
</ScrollView>

```

화면 내에 모든 스크롤 뷰가 보이도록 flex : 1 설정
refreshControl을 이용한 refreshing, onRefresh를 이용해 refresh 기능 추가

### useScrollRefresh(CustomHook)
```tsx
import { useState, useRef } from 'react';
import { WebView } from 'react-native-webview';

export default function useScrollRefresh(webViewRef:React.RefObject<WebView<{}>>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload(); // WebView 새로고침
    }
    setTimeout(() => setRefreshing(false), 1000); // 1초 후 새로고침 종료
  };

  return { refreshing, onRefresh, webViewRef };
}
```