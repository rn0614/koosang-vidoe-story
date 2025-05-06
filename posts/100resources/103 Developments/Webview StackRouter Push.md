---
title: Webview StackRouter Push
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Mobile을 Webview에서 history 관리
tags:
  - Front/React
  - 모바일/react-native/navigationStack
  - history
date: 2024/09/23 00:00:00
last_modified_at: 2024/09/23 00:00:00
---
## 무슨 문제를 해결했나?
> react-native의 webview에서 화면을 전환하게 되면 webview 상에서는 화면이 이동되지만 실제 모바일상에서는 동일주소를 보게된다. 문제는 이렇게 되면 기존 모방일에서 이용하는 뒤로가기나 모바일 history를 통해 처리했던 기능들을 처리 못하게 된다. 그래서 이를 해결하기 위해 모바일의 history를 조정해 주는 기능을 만들어야한다.


## 코드
### 1. 웹 코드(Nextjs) stackRouter.ts로 router 대신 stackRouterPush 사용

```ts
// 전역 타입 선언, react-natvie-webview 안에는 ReactNativeWebview 객체가 있음. 있으면 postMessage를 사용하려고 타입설정
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// react native app 환경인지 판단
export const isApp = () => {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
};

// ReactNative Webview에 postMessage 요청
const sendRouterEvent = (path: string): void => {
  window.ReactNativeWebView?.postMessage(
    JSON.stringify({ type: "ROUTER_EVENT", data: path })
  );
};

// 뒤로가기 하는 경우
export const stackRouterBack = (router: any) => {
  isApp() ? sendRouterEvent("back") : router.back();
};


// push 하는 경우
export const stackRouterPush = (router: any, url: string) => {
  isApp() ? sendRouterEvent(url) : router.push(url);
};


```

### 2. react-native webview 이벤트 송신 화면
// 해당 화면에서 useRequestOnMessage를 통해 커스텀 hook을 통해 onMessage를 통해 웹뷰로부터 받는 메세지를 확인
```tsx
import useRequestOnMessage from "@/hooks/useRequestOnMessage";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, RefreshControl } from "react-native";
import WebView from "react-native-webview";
import useScrollRefresh from "@/hooks/useScrollRefresh"; // 새로 만든 커스텀 훅 import

export default function SearchPage() {
  const router = useRouter();
  const targetUrl = process.env.EXPO_PUBLIC_THREE_URL! as string;
  const requestOnMessage = useRequestOnMessage(router, targetUrl);
  const { refreshing, onRefresh, webViewRef } = useScrollRefresh(); // 커스텀 훅 사용

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WebView
          ref={webViewRef}
          style={styles.webview}
          onMessage={requestOnMessage}
          source={{ uri: process.env.EXPO_PUBLIC_THREE_URL! + "/music" }}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
        />
      </ScrollView>
      <StatusBar hidden={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, // 안드로이드에서 StatusBar 높이만큼 패딩 추가
  },
  webview: {
    flex: 1,
  },
});

```


### 2. customHook
// useRequestOnMessage customHook 에서 온 이벤트가 ROUTER_EVENT 일경우에 같이온 path의 값에 따라서 react-natvie 화면이동. 이때 push에 보낼 정보를 담는다.
```tsx
import { Router } from "expo-router";
import { WebViewMessageEvent } from "react-native-webview";

type PathType = "/chat" | "/schedule" | "/spring" | "/three";
const validPaths: PathType[] = ["/chat", "/schedule", "/spring", "/three"];

function isValidPath(path: string): path is PathType {
  return validPaths.includes(path as PathType);
}

const useRequestOnMessage = (router: Router, targetUrl: string) => {
  const requestOnMessage = async (e: WebViewMessageEvent): Promise<void> => {
    const nativeEvent = JSON.parse(e.nativeEvent.data);
    if (nativeEvent?.type === "ROUTER_EVENT") {
      const path = nativeEvent.data;
      const title: string = nativeEvent.title || "default title";
      console.log("path :", path);
      if (path === "back") {
        router.back();
      } else if (path == "/") {
        router.push({
          pathname: `/`,
          params: {
            url: `${targetUrl}${path}`,
            id: `${targetUrl}${path}`,
            title: `${title}`,
          },
        });
      } else if (path == "/music") {
        router.push({
          pathname: `/(tabs)/`,
          params: {
            url: `${targetUrl}${path}`,
            id: `${targetUrl}${path}`,
            title: `${title}`,
          },
        });
      } else if (isValidPath(path)) {
        router.push({
          pathname: `/(tabs)${path}`,
          params: {
            url: `${targetUrl}${path}`,
            id: `${targetUrl}${path}`,
            title: `${title}`,
          },
        });
      } else {
        router.push({
          pathname: "/test/[id]",
          params: {
            url: `${targetUrl}${path}`,
            isStack: "Stack",
            id: `${targetUrl}${path}`,
            title: `${title}`,
          },
        });
      }
    }
  };
  return requestOnMessage;
};

export default useRequestOnMessage;

```


### 3. react-native webview ( 이벤트 수신 화면 )
// router.push(\{params\})의 params를 useLocalSearchParams() 로 가져올 수 있다.

```tsx
import Colors from "@/constants/Colors";
import useRequestOnMessage from "@/hooks/useRequestOnMessage";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export default function BookMarkDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const targetId = Array.isArray(id) ? id[0] : id;
  const targetUrl = "https://koo-sang-threejs.vercel.app";

  const requestOnMessage = useRequestOnMessage(router, targetUrl);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown:false
        }}
      />
      <WebView
        style={styles.webview}
        source={{ uri: targetId }}
        allowsFullscreenVideo={true}
        javaScriptEnabled={true}
        onMessage={requestOnMessage}
      />
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <View style={styles.backButtonInner}>
          <Feather name="arrow-left" size={20} color={Colors.black} />
        </View>
      </TouchableOpacity>
      <StatusBar hidden={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40, // 상태바 아래 위치를 적절히 설정
    left: 10, // 화면 왼쪽에서 10px 떨어진 위치
    borderRadius: 10,
    padding: 4,
    z 1, // WebView 위에 위치하도록 설정
  },
  backButtonInner: {
    padding: 6,
    borderRadius: 10,
  },
});

```
