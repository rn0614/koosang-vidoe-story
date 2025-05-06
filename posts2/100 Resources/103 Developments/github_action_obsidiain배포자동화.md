---
title: obsidiain github blog 배포자동화
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: 템플렛 테스트 github action으로 자동배포환경 작성
tags:
  - "#obsidian"
  - "#github_action"
  - "#github_blog"
date: 2024/09/17 00:00:00
last_modified_at: 2024/09/17 00:00:00
---
## 개요
> obsidian의 파일을 commit 하면 자동으로 githubBlog에 올리려고 하였다. 문제는 jeklly를 github으로 선택했는데 posting 파일에 대한 파일명 양식이 따로 정해져 있다는 것이다. 글 쓸 때마다 그 양식을 지키기는 너무 귀찮아서 commit 시점에 자동으로 파일명을 바꿔서 그 위치에 저장하는 workflow를 작성하기로 했다.(아마 1년 내내바꿔도 해당 workflow만드는 시간보단 덜들듯 하다.)

## github Action의 역할
github action의 역할은 명확하다. "트리거 발생 시 -> 이미 구조화된 이벤트 실행"이다.

## 내 코드
1. 트리거 :  master 브랜치에 push 할 때 동작
2. 구조화된 이벤트(workflow) : 하나의 단일 job으로 구성 (하나의 job은 하나의 트랜잭션)

// .github/workflows/push-to-posts.yml
```yml
name: Copy and Rename Files on Push

# trigger master 브랜치에 push 할 때 해당 workflows를 실행
on:
  push:
    branches:
      - master

# workflows 내부의 job들 각 job은 하나의 트랜잭션
jobs:
  copy_files:
    # 실행시키는 환경. 대규모 프로젝트면 프로젝트환경과 맞추기도 한다.
    runs-on: ubuntu-latest



    # job 내 프로젝트 하나의 steps는 하나의 트랜잭션안에 있어서 하나가 실패하면 전체 취소
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 0   # 전체 커밋 기록을 가져오기
                          # 디폴트가 현재 커밋이라 설정 안하면 HEAD^ 못가져옴. 

    # 한글 깨짐 수정
      - name: Set Git config to handle Korean filenames
        run: |
          git config --global core.quotepath false
      - name: Set UTF-8 locale
        run: |
          sudo update-locale LANG=en_US.UTF-8
          export LC_ALL=en_US.UTF-8
          export LANG=en_US.UTF-8

    # github action의 보안관련 설정
      - name: Set safe directory for Git
        run: |
          git config --global --add safe.directory /github/workspace

    # 유저 적용
      - name: Set up Git
        run: |
          git config --global user.name 'rn0614'
          git config --global user.email 'rn0614@naver.com'

    # 파일 copy & 이름변경 로직
      - name: Copy and Rename Files
        run: |
          # 플래그 변수 초기화
          FILE_COPIED=false

          # 오늘 날짜 형식 (YYYY-MM-DD)
          TODAY=$(date +"%Y-%m-%d")

          # 시작부분 로그 
          echo "변경파일 추출 시작"

          # 변경된 파일 목록을 임시 파일에 저장
          git diff --name-only HEAD^ HEAD 2>/dev/null > changed_files.txt

          # 임시 파일에서 파일명 추출 및 처리
          echo "추출된 파일 목록:"
          cat changed_files.txt  # 추출된 파일 목록을 출력하여 확인

          # 임시 파일에서 파일명 추출 및 처리
          while IFS= read -r FILE; do
            if echo "$FILE" | grep -E '.*.md$'; then
              if echo "$FILE" | grep -E '^_github_open/.*'; then
                echo "파일이 조건에 맞습니다: $FILE"  # 매칭된 파일 확인

                FILENAME=$(basename "$FILE" .md)  # 확장자 제거한 파일명

                # 파일명에서 공백을 '_'로 대체
                FILENAME_WITH_UNDERSCORES=$(echo "$FILENAME" | sed 's/ /_/g')

                # 새로운 파일명 생성 (YYYY-MM-DD-파일명.md)
                NEW_FILENAME="${TODAY}-${FILENAME_WITH_UNDERSCORES}.md"

                # 이름 formatting 완료된 파일이름 리스트 출력
                echo "COPIED_FILENAME : ${NEW_FILENAME}"

                # _posts 폴더로 파일 이동 및 파일명 변경
                cp "$FILE" "_posts/${NEW_FILENAME}"

                # 파일 복사 발생 시 플래그 변경
                FILE_COPIED=true
              fi
            fi
          done < changed_files.txt

          # 환경 변수 파일에 기록
          echo "file_copied=$FILE_COPIED" >> $GITHUB_ENV
      # 변경점 psuh
      - name: Commit and Push Changes
        run: |
          # GitHub Actions 환경 변수 참조
          echo "file_copied is: $file_copied"
          # 파일이 복사된 경우에만 커밋 및 푸시
          if [ "$file_copied" = "true" ]; then
            git add _posts/*.md
            git commit -m "Copy and rename files on push"
            git push origin master
          else
            echo "No files were copied. Skipping commit."
          fi
```



## 오류 해결기록

### 1. HEAD^ 를 못찾는 현상
```yml
# 에러
fatal: ambiguous argument 'HEAD^': unknown revision or path not in the working tree. Use '--' to separate paths from revisions, like this: 'git <command> [<revision>...] -- [<file>...]'


# 개선
steps:
  - name: Checkout repository
    uses: actions/checkout@v3
    with:
      fetch-depth: 0   # 전체 커밋 기록을 가져오기
                     # 디폴트가 현재 커밋이라 설정 안하면 HEAD^ 못가져옴. 

```

### 2. 한글 깨짐 수정
```yml
# 한글 깨짐 수정
  - name: Set Git config to handle Korean filenames
    run: |
      git config --global core.quotepath false
  - name: Set UTF-8 locale
    run: |
      sudo update-locale LANG=en_US.UTF-8
      export LC_ALL=en_US.UTF-8
      export LANG=en_US.UTF-8
```

### 3.  보안관련 설정
```yml
- name: Set safe directory for Git
  run: |
    git config --global --add safe.directory /github/workspace
```

### 4. 특정 위치에서 commit 된 md 파일 추출
```yml
# 변경된 파일 목록을 임시 파일에 저장
          git diff --name-only HEAD^ HEAD 2>/dev/null > changed_files.txt

          # 임시 파일에서 파일명 추출 및 처리
          echo "추출된 파일 목록:"
          cat changed_files.txt  # 추출된 파일 목록을 출력하여 확인

          # 임시 파일에서 파일명 추출 및 처리
          while IFS= read -r FILE; do
            if echo "$FILE" | grep -E '.*.md$'; then
              if echo "$FILE" | grep -E '^_github_open/.*'; then
                echo "파일이 조건에 맞습니다: $FILE"  # 매칭된 파일 확인

                FILENAME=$(basename "$FILE" .md)  # 확장자 제거한 파일명

                # 파일명에서 공백을 '_'로 대체
                FILENAME_WITH_UNDERSCORES=$(echo "$FILENAME" | sed 's/ /_/g')

                # 새로운 파일명 생성 (YYYY-MM-DD-파일명.md)
                NEW_FILENAME="${TODAY}-${FILENAME_WITH_UNDERSCORES}.md"

                # 이름 formatting 완료된 파일이름 리스트 출력
                echo "COPIED_FILENAME : ${NEW_FILENAME}"

                # _posts 폴더로 파일 이동 및 파일명 변경
                cp "$FILE" "_posts/${NEW_FILENAME}"

                # 파일 복사 발생 시 플래그 변경
                FILE_COPIED=true
              fi
            fi
          done < changed_files.txt

          # 환경 변수 파일에 기록
          echo "file_copied=$FILE_COPIED" >> $GITHUB_ENV
```


세팅하기 까지 너무 오래걸렸다.(힘들었다...)
