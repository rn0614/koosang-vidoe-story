---
title: DataView
excerpt: Dataview는 전통적인 옵시디언의 데이터 베이스 활용 방법이다.
categories:
  - Categories2
tags: 
permalink: /categories2/202411052036undefined/
toc: true
toc_sticky: true
date: "2024/11/05 00:00:00"
last_modified_at: "2024/11/05 00:00:00"
---
# Dataview란?
> 특정 폴더 내부 혹은 특정 태그를 포함하는 파일을 추려서 table형태로 표현할 수 있는 기능

# Property 기능
> 기본적으로 파일별로 property를 설정해 두어야 해당 property를 기준으로 데이터를 표기할 수 있다.

property 설정 방식은 `---` 세개로 감싸면 property를 표현할 수 있는 위치가 표기된다.


# Dataview 생성방법
- 직접 생성
  - yaml frontmatter
  - inline Data
- 페이지 내 자동 메타데이터
  - file.입력
- 데이터 필터링 하는 방법
  - DQL
  - dataviewjs

***property***1::value1

inline 사용 방법 [property::value]

property1 value is `=this.property`



```dataview
TABLE property, property1
WHERE file.name = this.file.name

```


```dataview
TABLE without id
  file.link as "파일명",
  title, 
  description,
  excerpt
FROM "_github_open/obsidian/DataviewEx"
```


# 가져오는 위치
FROM 경로 or `#태그`


https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-pages/