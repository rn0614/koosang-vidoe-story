---
title: 문자열을 찾아서 원래 문자열과 함께 replace
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: vscode 문자열을 찾아서 원래 문자열과 함께 replace 하는법
tags:
  - VSCode
  - Setting
date: 2025/02/02 23:39:46
last_modified_at: 2025/02/02 23:48:09
---
> Set a goal, make a plan and just do it.

# 문자열 한번에 replace

vscode를 쓰면서 간혹가다가 원래 문자열의 decoration으로 문자열을 바꿔야하는 경우가 있다.


그럴땐 정규식을 쓰면 된다. 

전체 정규식을 캡처그룹 `()` 으로 감싸게되면 $0,$1로 캡처그룹으로 저장이 가능하다. 

해당 부분을 사용하여 last_modified_at: yyyy-mm-dd 형식에 default 시간형식(00:00:00)을 붙여주는 방식으로 완성했다. 

 
![](public/image/Pasted%20image%2020250202234029.png)