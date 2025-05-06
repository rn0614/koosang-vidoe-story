---
title: 동시성 제어
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 데이터 정합성 문제에 따른 고찰
tags:
  - DB
  - SQL
  - 문제해결
date: 2024/11/26 00:00:00
last_modified_at: 2024/11/26 00:00:00
---
> Set a goal, make a plan and just do it.

# 개요
어떤 데이터를 핸들링 할 수 있는 페이지가 여럿 있고 혹은 한 페이지에서 두사람이 동시에 데이터를 수정할 때 0.1초라도 늦은 사람의 데이터는 수정 못하게 막고 싶다. 이런 내용을 동시성 제어라고 한다.


# 결론
결론부터 말하자면 대부분의 데이터는 수정시 수정시간을 기입하는데 UPDATE할 때는 이 수정시간까지 조건절에 추가 혹은 점검한다.

A사용자 조회  -> B사용자 조회 -> A사용자 UPDATE -> B사용자 UPDATE 과정에서 B사용자의 UPDATE를 막아야한다.

다음 순서대로 진행한다.
1. UPDATE되는 행 수를 사전에 파악한다.
2. WHERE 절에 수정시간까지 넣어서 UPDATE 진행
3. UPDATE 결과값이 이전에 파악한 행 수와 같은지 확인한다.

```JAVA
// input된 행수를 number로 카운트
int updatedPredictCnt = value;

int updatedCnt =doQuery("queryId", {parameters...});

if(updatedCnt != updatedPredictCnt){
  throw Error("update에러가 발생하였습니다.")
}
```

```SQL
UPDATE TABLE_A
SET COL1 ='A'
WHERE KEY1='A' AND KEY2='B' AND MOD_DDTT = SELECTED_DDTT
```

문제는 이런 방식은 리소스를 잡아먹기 때문에 빈번한 update가 복수의 사람들로부터 발생할 때 사용하도록 한다.
단일 행 UPDATE 확정이라면 updatedCnt가 1인지만 확인한다.

