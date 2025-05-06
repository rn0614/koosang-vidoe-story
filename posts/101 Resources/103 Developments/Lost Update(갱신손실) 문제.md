---
title: Lost Update(갱신손실) 문제
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: read한 데이터를 누군가 update 한 뒤 다시 옛날데이터 update하는 것을 방지할 때 데이터 정합성을 유지하는법
thumnail: 
tags:
  - DB
  - 문제해결
  - DBLOCK
date: 2025/03/14 20:17:15
last_modified_at: 2025/03/14 20:45:53
---
> Set a goal, make a plan and just do it.
## 문제상황
read한 데이터를 누군가 update 한 뒤 다시 옛날데이터 update함.

1) 1번 사용자가 데이터를 조회
2) 2번사용자가 해당 데이터의 col2를 업데이트함.
3) 1번 사용자가 col1의 데이터를 업데이트 하면서 2번사용자의 col2의 데이터를 다시 옛날 데이터로 업데이트함.

## 해결방안
버전관리 방식( 낙관적 동시성 제어중 하나)
내 어플리케이션의 경우 충돌이 잦지 않고 조회를 하는 기능에 영향을 주고 싶지 않다. 따라서 modified_at을 두어 변경시간을 특정하고 마지막으로 조회한 시점의 변경시간과 update 한 시점의 변경시간과 같은 경우에만 업데이트를 하도록한다.

### 1.버전관리(충돌이 빈번하지 않을때/ select와 update 간의 텀이 길 때)
데이터를 update 할 때 update 버전을 가지고 있거나 혹은 데이터 자체적으로 update 타임스탬프로 관리한다.
DB자체적으로 여유가 있다면 loging 을 통해 전체 버전관리 전체 db관리를 하며, 여유가 없다면 modified_at을 두어 이게 최종버전을 보는건지 확인하는 것이 좋다.

첫번째 경우는 전체 버전이므로 어떤게 application 단에서 어떤 값을 조회했고 update했는지가 명확하기 때문에 구분해서 업데이트 해줄 수 있다. 
두번째 경우는 변경시간만 알 뿐 특정을 하지 못한다. 따라서 1번사용자가 변경을 할 때 누군가 데이터를 변경했고 재조회를 해야한다는 알람을 다시 주어야한다. 이 경우 사용자경험이 떨어지게 된다.

```SQL
-- 버전관리
UPDATE my_table
SET col1 = ?, version = version + 1
WHERE id = ? AND version = ?

-- modified_at 관리
UPDATE my_table
SET col1 = ?, modified_at= sysdate
WHERE id = ? AND modified_at = ?
```
### 2.즉각적잠금(select와 update간의 텀이 짧고 충돌이 빈번할 때)
 SELECT 할 때 다른 CONNECTION에서 조회를 못하도로 LOCK을 건 뒤 UPDATE를 진행한다.

```SQL
-- 트랜잭션 시작
BEGIN
    -- 특정 행에 대해 즉시 잠금 획득
    SELECT col1, col2 
    FROM my_table 
    WHERE id = ? 
    FOR UPDATE;
    -- 이후 해당 행을 안전하게 업데이트
    UPDATE my_table 
    SET col1 = ? 
    WHERE id = ?;
    -- 작업 완료 후 커밋 (잠금 해제)
    COMMIT;
END;
```


## 주의사항
대부분의 상황에서는 버전관리로 업데이트를 한다. 즉각적잠금의 경우 하나의 프로세스를 최대한 짧게 가져가야 시스템 성능을 최적화 할 수 있다.
