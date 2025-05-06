---
title: OSI 7계층
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 네트워크 통신 계층
tags:
  - Network
date: 2024/11/17 00:00:00
last_modified_at: 2024/11/17 00:00:00
---
> Set a goal, make a plan and just do it.

## OSI 7계층

1. 물리 : 랜카드에서 전기신호를 0,1의 조합으로 변경한다.
2. 데이터링크 : 
  1. 사용자를 구분하기 위해서는 MAC 주소를 사용(랜카드 ID)
  2. 목적지의 MAC주소를 스위치/ 허브를 이용 ( 최신은 스위치를 사용 )
  3. 스위치간에는 서로간 맥으로 
  4. WIFI 는 ACCESS POINT가 필요
3. 네트워크 : 
  1. 데이터링크 계층에서 목적지/출발지/유형등을 제외한 데이터 부분
  2. IP , 256^4
  3. 목적IP, 출발IP가 존재
  4. 공인IP와 사설IP가 존재
  5. IP 마지막이 255면 브로드캐스트
  6. IP 마지막이 1이면 ROUTER
  7. 127.0.0.1 은 LOOPBACK 으로 localhost
4. 전송 :
  1. 포트: 80,443,22,53  / HTTP, HTTPS, SSH, DNS
  2. HTTP1.1/2는 전부 TCP, HTTP3부터 다시 UDP
5. HTTP:
  1. HTTP헤더+ HTTP본문
  2. 헤더는 요청/응답 헤더가 두개가 존재
  3. GET/ index.html, HOST
  4. 헤더와 본문은 빈칸줄 하나로 구분
  5. SSL/TLS