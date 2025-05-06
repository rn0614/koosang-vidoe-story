---
title: Nextjs 백엔드를 언제 사용해야할까
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: Nextjs는 Front, Backend 둘다 사용할 수 있는 framework이다. 하지만 큰 프로젝트에서는 그렇게 사용하지 않는다 왜일까? 또 언제 이렇게 사용해야할지 알아보자
tags:
  - Front/Nextjs
permalink: /categories2/202410062151백엔드를/
date: 2024/10/06 00:00:00
last_modified_at: 2024/10/06 00:00:00
---
# Nextjs 백엔드
> nextjs 에서 api/ route.ts 를 이용해 주소를 받는 백엔드 동작을 하는 위치

# 언제 사용할까?
우선 기본적으로는 Nextjs 백엔드의 경우 작은 서버일때 동시에 이용할것. 규모가 커진 서버에서 서버 부하에 따라서 서버를 증설하는데 back/ front 부분을 따로따로 증설이 가능함. api router를 쓰면 두개를 동시에 증설해야해서 낭비가 된다.