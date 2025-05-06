---
title: COMMIT MESSAGE규칙
CMDS:
  - "[[posts/900 Settings/901 Main/103 Developments]]"
excerpt: git merge 하기위한 형상관리 방식에 대해서 이야기 해보자
tags:
  - "#commit_messge"
  - 형상관리
  - 문제해결
date: 2025/01/30 00:00:00
last_modified_at: 2025/01/30 00:00:00
---
## PR의 중요성
> 1인개발자여도 PR을 할 때 COMMIT 메세지는 중요하다. 처음 메세지를 적을 때 단순하게 뭘 개발했다라고만 관리를 했었는데 프로젝트를 진행하면서 점점 이전에 기능을 뺄때도 있고 이 코드는 언제 수정했는지 확인하면서 왜 이 코드를 수정했는지 알 수 없는 경우도 나왔다. 특히 프로젝트가 길어지면서 이런 부분에서 내 COMMIT 메세지를 개선해야할 필요성을 느꼈다.

 현재 내가 다니는 회사에서는 사용자가 요청한 명칭을 가지고 COMMIT을 적용하고 있다. 이런식으로 하면 요청자가 보낸 제목과 COMMIT메세지가 같아 단기적인 수정에는 문제가 없지만 장기적으로 같은 요청제목으로 사용자가 보낼땐 요청번호를 한번더 확인하거나 조금만 지나도 제목만으로 요청이 무엇인지 파악하기 힘들다는 단점이 있다.


## Commit Message의 구성화
> COMMIT 메세지를 표준화해야한다. 우선 여러 블로그를 다녀본 결과 아래 블로그에서 처리한 내용에 따라서 정리한게 많다. 우선 해당방식으로 구현한 내용에 대해서 알아보자

가장 많이 쓰는 전통적인 conventional Commit 방식으로 따라간다. 무엇이든 처음할 때는 전통적인것을 따라가보고 내가 필요한 것을 추가하거나 개선하는 방향으로 하는게 효율이 좋았다.
(나의 경우는 post로 posting할 때 쓰는 부분도 추가)
https://www.conventionalcommits.org/en/v1.0.0/

| **태그**      | **설명**                                       |
| ----------- | -------------------------------------------- |
| `feat:`     | 새로운 기능 추가                                    |
| `fix:`      | 버그 수정                                        |
| `docs:`     | 문서 수정 (README, 주석 등)                         |
| `style:`    | 코드 스타일 변경 (포매팅, 세미콜론 추가 등 기능 변경 없음)          |
| `refactor:` | 코드 리팩토링 (기능 변경 없이 코드 개선)                     |
| `perf:`     | 성능 개선                                        |
| `test:`     | 테스트 코드 추가/수정                                 |
| `chore:`    | 빌드 시스템, 패키지 매니저 설정 변경 (코드 수정 X)              |
| `ci:`       | CI/CD 관련 설정 변경                               |
| `build:`    | 빌드 관련 파일 수정 (예: package.json, webpack 설정 변경) |
| `revert:`   | 이전 커밋을 되돌림                                   |
| `infra:`    | 인프라 관련 수정 (서버, 배포 설정 등)                      |
| `post:`     | 블로그 포스팅글 추가                                  |

## commit 메세지 자동 템플릿
> template가 있으므로 어느정도 자동으로 채우는 템플릿을 맞추는게 좋다. 루트폴더에 다음과 같이 txt 폴더를 만들고 나서 global 설정을 해주면 commit 창에서 자동으로 메세지가 나오고 git commit을 쳤을 때 자동으로 템플릿이 나오게 된다.
![](public/image/Pasted%20image%2020250319010618.png)

```shell
git config --global commit.template ./template.txt
```


// template.txt
```txt
feat: 제목

본문위치
feat:	새로운 기능 추가
fix:	버그 수정
docs:	문서 수정 (README, 주석 등)
style:	코드 스타일 변경 (포매팅, 세미콜론 추가 등 기능 변경 없음)
refactor:	코드 리팩토링 (기능 변경 없이 코드 개선)
perf:	성능 개선
test:	테스트 코드 추가/수정
chore:	빌드 시스템, 패키지 매니저 설정 변경 (코드 수정 X)
ci:	CI/CD 관련 설정 변경
build:	빌드 관련 파일 수정 (예: package.json, webpack 설정 변경)
revert:	이전 커밋을 되돌림
infra:	인프라 관련 수정 (서버, 배포 설정 등)

Resolves: #123
```