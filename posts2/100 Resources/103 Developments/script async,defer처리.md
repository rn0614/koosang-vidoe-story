---
title: script async,defer처리
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: script-asyncdefer
thumnail: 
tags:
  - Front/Browser
date: 2025/02/05 01:23:31
last_modified_at: 2025/03/18 21:19:56
---
## 개요
레거시 환경에서 개발하다보면 `<script defer>` 같이 defer 를 종종보게된다. 해당 요소의 의미는 파싱과정에서 script를 만나게 되더라도 병렬로 다운받으라는 의미이다. html이 처음 나왔을 때는 script요소를 만나면 파싱을 중단하고 즉각적으로 다운로드 받았지만 이제 defer로 파싱을 하면서 다운받게 된다. 이런 dom 파싱 여부와 실행시점은 script에 달려있는 defer, async 와 script태그의 위치에 따라서 결정된다.

## 확인점
기본적으로 dom파싱이 중단되고 js 를 실행하는건 사용자 경험에 안좋은 영향을 끼친다.
또한 async의 경우 실행 순서가 dom 파싱이후 js실행이 보장되지 않으므로 특정 상황을 제외하고는
defer를 쓰도록 하고 특히 script가 head에 있을 때는 무조건 defer/async를 명시하도록 하자.

## async, defer, 없음 비교

| `<script>` 위치 | `<script>` 속성 | 다운로드        | 실행 시점             | HTML 파싱 중단 여부 |
| ------------- | ------------- | ----------- | ----------------- | ------------- |
| `<head>`      | 없음            | 🚨 직렬(파싱중단) | 🚨 `<head>`에서 실행됨 | ✅ 파싱 중단       |
| `<head>`      | `async`       | ✅ 병렬        | ❌ 다운로드 완료 즉시 실행   | ✅ 파싱 중단       |
| `<head>`      | `defer`       | ✅ 병렬        | ✅ HTML 파싱 후 실행    | ❌ 파싱 중단 없음    |
| `<body>`      | 없음            | ✅ 병렬        | ✅ HTML 파싱 후 실행    | ❌ 파싱 중단 없음    |
| `<body>`      | `async`       | ✅ 병렬        | ❌ 다운로드 완료 즉시 실행   | ✅ 파싱 중단       |
| `<body>`      | `defer`       | ✅ 병렬        | ✅ HTML 파싱 후 실행    | ❌ 파싱 중단 없음    |


## async가 유리한 상황
> 실행 순서가 중요하지 않은 독립적인 스크립트에 유용 / 광고, 트래킹, sns위젯등의 외부 스크립트

* 단, 광고사이트 등이 모종의 이유로 js를 늦게 준다면 html parsing이 계속 되지 않는 경우가 발생(일부 구글광고가 defer를 지원안함...)