---
title: github Action
excerpt: github action 학습
categories: Categories2
tags:
  - "#github_action"
date: 2024/09/17 00:00:00
last_modified_at: 2024/09/17 00:00:00
---
## 개요
> 인프런 기반의 내용 작성입니다.
> github Action이란 특정 이벤트 발생시 내가 짜둔 프로세스를 실행하도록 하는 자동화 툴이다.
> 깃허브 이벤트에 따라 workflow 실행

## 내용
크기에 따라서 포함관계를 갖는다
Workflow > Job > Step

가장 작은 transaction 단위는 Job 단위 Step 실행 순서는 보장된다.

.github/workflow 경로에 파일이 있으면 github 측에서 자동으로 workflow 파일인지 인지한다.


## 기초 템플릿
```yaml
name: workflow name # workflow의 명칭
on: push #trriger 

jobs:
  job1:
    runs-on: ubuntu-latest # github action 실행환경
    steps:
    - name: #실행 step
      run: |
        echo "job done" #실행내용

  job2:
    runs-on: unbuntu-latest
    

```


## 코드 명칭(output으로 확인)


### name: workflow명칭(필수) 
### on: 실행조건(필수)
> 복수조건 사용 가능
- push
- pull_request
  - `types: [opened]` , default는 opened, synchronize, reopened
- workflow_dispatch
  - inputs:
    name:
      description:
      required
      default:
      type:
        environment:
      description:
      required:
      default:
      type:
      options:
- issues
  - `types: [opened]` 타입조정
- issue_comment
- schedule
  - `- cron: '15****'` 실행주기 무조건 실행시켜주진 않는다...
### jobs: 실행하는 환경(필수) 
#### job명칭(필수) 
#### if: 조건(선택)
- $\{\{ github.event.issue.pull_request \}\} : 이벤트가 pull_request인지 확인
#### runs-on: ubuntu-latest(필수)
#### needs(선택)
- `[선행job]` : 선행 job이 성공했을 때만 실행하기
#### steps: (필수)
#### - name: step명칭(필수)
####    run: 실행내용(필수)
- echo 출력내용
- exit 1 # job 강제실패
- uses: actions/upload-artifact@v3 # 외부 artifact 사용
- with:
  - name: artifact 저장위치
  - path:  저장파일명





# CI/CD
> CI는 개발자가 개발한 코드를 공통코드로 올리기 전 테스트하는 단계
> CD는 테스트 완료된 코드를 빠르게 DEPLOY 하는 단계
- CI에서 테스트 수행: 
  - pr open : 개발자가 처음 변경사항을 적용하고자 할때 pr
  - synchronize : 최초의 pr말고 추가적인 수정이 있을 때도 확인
- CD에서 배포 수행
  - pr merge: 검증된 코드를 신속하게 배포


개발환경 배포(on: pull_request)
  : set-env -> image-build -> deploy(dev)

QA환경 배포(on: push)
  : set-env -> image-build -> deploy(qa) -> create-pr

운영환경 배포(on: pull_request)
  : set-env -> image-build -> deploy(staging) -> approve -> deploy(prod)




* commit을 했을 때 바로 dev에 반영되지 않고 pr을 거쳐서 반영됨