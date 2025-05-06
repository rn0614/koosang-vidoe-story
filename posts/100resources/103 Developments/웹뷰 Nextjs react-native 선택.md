---
title: 웹뷰 프레임워크 선택
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 웹뷰를 선택하는데 있어서 어떤 고민과정이 있었는지 정리
tags:
  - 모바일/react-native
date: 2024/11/25 00:00:00
last_modified_at: 2024/11/25 00:00:00
---
> Set a goal, make a plan and just do it.

## 결론
웹 : REACT, NEXTJS
모바일 : REACT-NATIVE , WEBVIEW 혼용

## 근거
### 웹 선택 이유
>현재 REACT 생태계가 불편하다는 인원도 많지만 대부분의 AI가 학습하는 코드가 REACT 코드이다. 특히 NEXTJS가 먼저 세팅해 놓은 것이 있기 때문에 초기에 많은 자원없이 웹을 빠르게 만들 수 있다. 그래서 나도 NEXTJS를 선택하였다. 다만 NEXTJS 자체가 무겁기 때문에 가변운 웹을 만들기 위해서는 오히려 REACT를 선택하는 방안도 괜찮았다. REACT는 VITE빌드에서 생성했다.

### 모바일선택 이유
> 나는 혼자 개발하기 때문에 android, ios 의 네이티브 코드를 작성하는 것을 최소화하는 것을 목표로 하고 있다. view-view 성능으로도 충분히 사용자가 만족할만한 성능이 나오며 더 최적화가 필요한 화면에서는 react-native를 통해 하는 것으로 서비스를 제공하기에 충분하다고 판단되었다.


## 종류
### 1. Mobile App
#### 1-1.hybrid app(React-native)
 Android, Ios가 있지만 나는 React-Native를 선호한다. 이유는 React 지식이 있다면 러닝커브가 높진 않으며 간단한 어플리케이션의 경우 하나로 Android와 IOS 서비스가 가능하다. 성능은 네이티브보다 떨어지지만 ios, android둘다 동작하도록 앱을 만들 수 있다는 입장에서 생산성이 크게 증가한다.

#### 1-2. webview
App을 관리하다보면 배포 플랫폼의 버전관리 재배포에 관해서 제약이 따른다. Webview를 사용하면 재배포 없이 Web을 변경하므로 빠르게 배포가 가능하며 수정이 비교적 쉽다. 성능적인 부분에서 약할 수 있지만 현재는 증권가(toss, 실시간 chart)에서도 쓸만큼 성능적으로도 큰 문제가 없다고 판단된다.
### 2. Mobile Web
단순 모바일에서 Web사이트로서 서비스에 접근하는 것이다. Mobile browser에 종속되기도 하고 사용자가 결국 해당 웹을 즐겨찾기로 들어가야하기 때문에 사용성이 떨어지고 Web적인 부분이 강하기 때문에 App 기능을 쓰지 못한다.

### 3. Desktop Web(Next.js)
일반적이 사이트 접근이다. Pc에서 접근하기 때문에 다들 어느정도 불편함을 감수하고 들어와야한다. 위 webview와 Mobile Web의 기본형태이고 반응형으로 위 내용들을 커버한다.

### 4. Desktop App
사용자가 PC에 설치해서 사용하는 상태. Web의 내용을 쓸거면 Electron을 이용해서 개발한다.
