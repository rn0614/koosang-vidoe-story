---
title: 실무상황 SQL
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 실무상황에서 볼 수 있는 SQL 모음
thumnail: 
tags:
  - DB
date: 2025/02/18 20:32:09
last_modified_at: 2025/02/18 21:33:45
---
## group by 하는데 특정 컬럼(col2)값이 큰애의 col3
> GROUP BY를 쓰다보면 합계값하고 일부는 GROUP BY 데이터중 특정행의 값을 가져와야한다. 그럴 때 사용한다.


상황 : 테이블을 group by 하는데 이 테이블은 pk1, pk2, col1, col2, col3 으로 이루어 있고 group by를 pk1으로 한다. col1의 합계를 가져오면서 col2='B'인 것 중 col1이 가장 큰 행의 col3의 합을 구하고 싶어

- DENSE_RANK FIRST 는 정렬 후 첫번째

```SQL
SELECT pk1,
       SUM(col1) AS total_col1,
       MAX(col3) KEEP (
           DENSE_RANK FIRST 
           ORDER BY CASE WHEN col2 = 'B' THEN col1 ELSE NULL END DESC
       ) AS col3_with_max_col1
FROM sample_table
GROUP BY pk1;
```


## PIVOT
> FRONT로 데이터를 던져줄 때 집계 단위를 던져줘야하는 경우는 다음과 같이 쓴다. 1,2,3,4분기의 데이터를 PIVOTTING한 예시

```SQL
SELECT 
  year,
  SUM(CASE WHEN quarter = 'Q1' THEN sales ELSE 0 END) AS Q1,
  SUM(CASE WHEN quarter = 'Q2' THEN sales ELSE 0 END) AS Q2,
  SUM(CASE WHEN quarter = 'Q3' THEN sales ELSE 0 END) AS Q3,
  SUM(CASE WHEN quarter = 'Q4' THEN sales ELSE 0 END) AS Q4
FROM sales_data
GROUP BY year
ORDER BY year DESC;

```


## KeySet Pagination
> limit offset은 offset 값이 커질수록 앞에 값도 결국 다 읽는 형태라 성능이 저하된다.

- 특정 max key값을 가져와서 제한조건으로 둔다

```SQL
-- Keyset Pagination 방식
SELECT *
FROM posts
WHERE id > :last_id  -- 이전 페이지에서 마지막으로 조회한 id (예: 150)
ORDER BY id ASC
LIMIT 10;

```