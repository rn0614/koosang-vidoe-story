---
title: 동시성 에러로 Insert 2번발생 오류
CMDS: "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 데이터를 업데이트 할 때 Merge
tags:
  - DB
  - SQL
  - 문제해결
  - transaction
date: 2024/11/26 00:00:00
last_modified_at: 2024/11/26 00:00:00
---
## 문제상황
### 1. 동일한 pk의 insert, update 케이스
merge 문을 사용해서 데이터가 없으면 insert 있으면 update 하는데 같은 pk값으로 insert, update가 빠르게 진행될 경우 insert 구문을 2번시도하는 문제가 발생하였다.

## 해결방안
### 1. **에러 처리 후 UPDATE 재시도:**  
두번째 MERGE 문이 INSERT를 시도하고 중복 키 에러가 발생하면, 이를 catch하여 해당 레코드에 대해 UPDATE를 수행하도록 합니다. 이때 두번째 MERGE 문이 의도한 데이터로 업데이트하게 됩니다.

### 2. **버전 관리 또는 타임스탬프 도입:**  
만약 여러 업데이트가 충돌할 가능성이 있다면, 버전 번호나 타임스탬프를 이용해 업데이트 충돌을 감지할 수 있습니다. 예를 들어, UPDATE 시점에 읽어왔던 버전과 현재 버전을 비교해서, 예상치 못한 충돌(다른 업데이트가 이미 반영된 경우)을 감지하고, 사용자에게 충돌 해결(재시도, 병합 등)을 요청할 수 있습니다.

### 3. **비즈니스 로직에 따른 우선순위 결정:**  
상황에 따라 어떤 업데이트가 최종적으로 적용되어야 하는지를 비즈니스 로직에서 명확히 정의해야 합니다. 예를 들어, 가장 최근의 업데이트가 유효하도록 한다면, 타임스탬프 기반의 비교를 통해 나중에 온 업데이트가 승리하도록 처리할 수 있습니다.

```SQL
CREATE OR REPLACE FUNCTION merge_row(
    p_id TEXT,
    p_update_do TEXT,
    p_update_type TEXT,
    p_insert_do TEXT,
    p_insert_type TEXT
) RETURNS VOID AS $$
DECLARE
    v_retry INT := 0;
    v_max_retries INT := 3;
    v_sleep_seconds NUMERIC;
    v_rows_affected INT;
BEGIN
    LOOP
        BEGIN
            -- 1. 먼저 UPDATE 시도
            UPDATE tablea
            SET "do" = p_update_do, "type" = p_update_type
            WHERE id = p_id;
            
            GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
            
            -- 2. 업데이트된 행이 없으면 INSERT 시도
            IF v_rows_affected = 0 THEN
                INSERT INTO tablea(id, "do", "type")
                VALUES (p_id, p_insert_do, p_insert_type);
            END IF;
            
            -- 작업 성공 시 함수 종료
            RETURN;
        EXCEPTION
            WHEN unique_violation THEN
                -- 중복 키 오류 발생 시 재시도 처리
                v_retry := v_retry + 1;
                IF v_retry > v_max_retries THEN
                    RAISE EXCEPTION 'Maximum retry count reached for merge_row';
                END IF;
                -- 지수적 백오프: 0.1초 * 재시도 횟수 만큼 대기
                v_sleep_seconds := 0.1 * v_retry;
                PERFORM pg_sleep(v_sleep_seconds);
                -- 재시도 루프로 돌아감
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

```

## 내 방식
application에서 실행 시 관리가 힘들것 같아서 해당부분은 db에서 관리하도록 하였다.