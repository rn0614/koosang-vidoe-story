# Koosang Project 관련

---
## 개요
 - 이 프로젝트는 구상모 개인의 MVP, 개발실력 함향을 위해서 개발됐습니다.


## 주요 기능

- dashboard : 메인 추세를 보기 위한 대시보드 기능
- rag : 개인 obsidian 정보의 rag 시스템 구현 및 블로그 기능을 위한 구현
- alarm : 개인/회사의 알람시스템를 위한 MVP 
- workflow : 프로젝트 진행상황의 관리를 위한 프로젝트 MVP
- game : 기본 보드게임 / threejs 이용 3d handling 연습을 위한 프로젝트트
- note : 기본 CRUD확인용
---

## 기술 스택

- **React 18** / **Next.js 14+(app router)**
- react-query, justand
- TypeScript
- Tailwind CSS, shadcn/ui
- Supabase (DB, 인증)
- Lucide-react (아이콘)
- 기타: fetch API, 커스텀 훅, 상태관리(useState/useCallback 등)

---

## 실행 방법

1. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

2. **환경 변수 설정**
   - `.env.local` 파일에 Supabase 등 필요한 환경변수 입력

3. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

4. **접속**
   - [http://localhost:3000](http://localhost:3000) 에서 확인

---
