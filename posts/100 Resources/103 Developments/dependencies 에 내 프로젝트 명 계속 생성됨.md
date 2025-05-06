---
title: dependencies 에 내 프로젝트 명 계속 생성됨
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: dependencies 에 내 프로젝트가 계속 생성되는 문제
tags:
  - "#문제해결"
  - Front/React/Library
permalink: /categories2/202408120012에/
date: 2024/09/22 00:00:00
last_modified_at: 2024/09/22 00:00:00
---
## 문제상황
> dependencies 부분에 내 프로젝트 명으로 file: 경로로 프로젝트 경로로 참조하고 있었다.
> 결과는 아래와 같이 에러 npx expo-doctor를 통해 확인해보니 의존성 부분에 문제가 있다고 하는데 확인해보니 아래와 같이 dependencies에 내 프로젝트가 직접적으로 포함되고 있다.


## 원인 및 해결
> 내 실수다 패키지 링크한걸 까먹어서 링크된 채로 계속 빌드돼서 발생한 문제였다

1. script실행
```shell
npm link # 이 명령어 때문에 내가 정한 하나의 프로젝트가 갑자기 모든 프로젝트롸 링크했다....

npm ls --link --depth=0 #  이 명령어로 전체 링크된 패키기지를 확인하고

npm unlink -g <패키지명>  # 해당명령어로 링크를 해제해주면 된다.

```
2. 이후에는 package-lock.json, node_modules 삭제 및 package.json dependencies에서 제거 후 npm install 하면 정상적으로 실행됐다.