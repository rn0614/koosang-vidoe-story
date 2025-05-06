---
title: SpringBoot react 디버깅 설정
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: SpringBoot랑 react를 하나의 ide에서 사용하기 위한 세팅
tags:
  - "#Back/SpringBoot"
  - "#Front/Nextjs"
  - "#환경설정"
  - "#문제해결"
  - "#VSCode"
  - 개발도구
date: 2024/09/17 00:00:00
last_modified_at: 2024/09/17 00:00:00
---
## Springboot, Nextjs를 하나의 VScode 제어

## 개요
> 문제의 본질은 하나의 IDE에서 BACK, FRONT를 동시에 DEBUGGING해야 편하다는 점이다. 물로 NEXTJS 의 경우 크롬창에서 디버깅이 가능하지만 BACK단 로직은 직접적으로 VSCODE에서 디버깅하기가 편하다는 장점이 있다.

## 어떤 문제를 해결했나?
### 1. 복수의 시스템(FRONT, BACK)을 하나의 IDE로 제어
> 배경지식
> 1. Vscode 관련해서 디버깅 모드의 관리는 root dir의 .vscode/launch.json 파일에서 관리한다.
2. 해당폴더 내 configuration 에서는 각각 실행환경을 정의한다.

#### lanch.json 파일 수정
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    // backend debugging 설정(Spring boot)
    {
      "type": "java",
      "name": "SpringBackApplication",
      "request": "launch",
      "mainClass": "com.backproject.springback.SpringBackApplication",
      "projectName": "spring-back",
      "cwd":"${workspaceFolder}/spring-back"     // 백엔드 위치선언
    },
    // frontend debugging 설정(Next.js)
   {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/front",          // 전체 root위치 선언(node.js)
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome",
        "webRoot": "${workspaceFolder}/front"     // 클라이언트 위치선언(웹 리소스)
      }
    }
  ]
}
```


## 개인의견
독학을 하는 입장에서 비빌 곳은 디버깅이다. 물론 CS적 지식을 알아야하는 부분도 있지만 에러 발생 시 가장 먼저 필요한 행동은 "어디서 발생했는지" 를 찾는 것이다. 그리고 이런 부분에 대한 노동도 시간이 많이든다.
결국 클린코드라는 것도 이런 고장난 부분을 빠르게 찾기 위한 네이밍, SOLID원칙 등이 생겨난 것이라고 생각이 든다.

디버깅설정