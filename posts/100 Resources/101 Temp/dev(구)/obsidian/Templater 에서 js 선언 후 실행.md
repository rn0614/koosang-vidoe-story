
# properties 설정
> obsidian 으로 작성한 글을 블로그 글로 옮기는 중에 필요한 글을 작성하기 위해서 properties를 세팅해줘야하는데 이부분을 templater로 설정해서 추가적인 작성 없이도 충분히 하도록 설정을 하도록 한다.

이 내용을 통해 SEO를 적용하려고 한다.

우선 plugIn으로 Templater를 설치한다.
![](public/image/Pasted%20image%2020250131013636.png)


이후로는 Template가 모여있는 Template folder location의 위치를 특정하고 script가 있는 부분도 위치를 정해준다.

![](public/image/Pasted%20image%2020250131013700.png)

![](public/image/Pasted%20image%2020250131013154.png)



template는 해당 template.md 파일에

`<% tp.~ %>`  방식으로 사용할 수 있다.
tp 객체는 다음과 같다. 
![](public/image/Pasted%20image%2020250131013855.png)


내가 폴더에 넣은 js 코드는 tp.user.js파일명() 형태로 사용할 수 있다.
원래 
```js
function get_reading_time(tp) {
  console.log('tp',tp)
  console.log(tp.file.title)
  let content = app.vault.read(tp.file.title);
  let wordCount = content.split(/\s+/).length;
  return String(Math.ceil(wordCount / 200)); // 문자열로 변환
}


module.exports = get_reading_time;

```

# Obsidian Templater (`tp`) 주요 메서드

## 파일 관련 (`tp.file`)
| 메서드 | 설명 | 사용 예시 |
|--------|------|----------|
| `tp.file.path` | 현재 파일의 전체 경로 | `<% tp.file.path %>` |
| `tp.file.folder(true)` | 현재 파일이 속한 폴더 (루트 포함) | `<% tp.file.folder(true) %>` |
| `tp.file.title` | 현재 파일의 제목(확장자 제외) | `<% tp.file.title %>` |
| `tp.file.create_new(filename, folder, content?)` | 새로운 파일을 특정 폴더에 생성 | `<% tp.file.create_new("NewNote.md", "Notes", "# 제목") %>` |

---

## 날짜 및 시간 (`tp.date`)
| 메서드 | 설명 | 사용 예시 |
|--------|------|----------|
| `tp.date.now(format?)` | 현재 날짜 및 시간 | `<% tp.date.now("YYYY-MM-DD HH:mm") %>` |
| `tp.date.today(format?)` | 오늘 날짜 | `<% tp.date.today("YYYY-MM-DD") %>` |
| `tp.date.tomorrow(format?)` | 내일 날짜 | `<% tp.date.tomorrow("YYYY-MM-DD") %>` |
| `tp.date.yesterday(format?)` | 어제 날짜 | `<% tp.date.yesterday("YYYY-MM-DD") %>` |
| `tp.date.custom(format, offset, unit)` | 특정 날짜 기준 offset 계산 | `<% tp.date.custom("YYYY-MM-DD", -1, "day") %>` (어제) |

---

## 링크 및 메타데이터 (`tp.frontmatter` & `tp.file.link`)
| 메서드 | 설명 | 사용 예시 |
|--------|------|----------|
| `tp.frontmatter.key` | 현재 파일의 Frontmatter 속성 가져오기 | `<% tp.frontmatter.author %>` |
| `tp.file.link` | 현재 파일의 Obsidian 링크 | `<% tp.file.link %>` |
| `tp.file.basename` | 현재 파일의 제목(확장자 제거) | `<% tp.file.basename %>` |

---

## 템플릿 삽입 및 실행 (`tp.user` & `tp.system`)
| 메서드 | 설명 | 사용 예시 |
|--------|------|----------|
| `tp.user.function_name()` | 사용자 정의 함수 실행 | `<% tp.user.myFunction() %>` |
| `tp.system.clipboard()` | 클립보드 내용 가져오기 | `<% tp.system.clipboard() %>` |
| `tp.web.get(url, params?)` | 웹 요청(GET) 실행 | `<%* let data = await tp.web.get("https://api.example.com") %>` |

---

## 루프 및 제어문 (`tp.loop`)
| 메서드 | 설명 | 사용 예시 |
|--------|------|----------|
| `tp.loop.range(start, end, step?)` | 숫자 범위 반복 | `<% tp.loop.range(1, 5).join(", ") %>` (출력: `1, 2, 3, 4, 5`) |
| `tp.loop.array(myArray)` | 배열 요소 반복 | `<% tp.loop.array(["A", "B", "C"]).join(", ") %>` |

---

## 예제 템플릿 코드
```js
<%
const noteTitle = tp.file.title;
const todayDate = tp.date.now("YYYY-MM-DD");
const author = tp.frontmatter.author || "Unknown";

tR += `# ${noteTitle}\n`;
tR += `> Created on ${todayDate} by ${author}`;
%>
