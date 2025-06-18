# Koosang Project

---
## 프로젝트 개요
- **기술적 성장과 실력 향상**을 목적으로 한 구상모 개인의 MVP 프로젝트입니다.
- 다양한 기술 스택과 아키텍처, 실전 패턴을 실험하고 학습하기 위한 Playground입니다.

---
## 주요 기능 및 도메인 설명

- **dashboard**
  - 전체 서비스의 통계값, 트렌드, 주요 지표를 시각화하는 대시보드입니다.
  - Web Vitals, 사용량, 각종 데이터의 추세를 한눈에 볼 수 있습니다.

- **rag**
  - 개인 Obsidian 지식베이스와 연동된 RAG(Retrieval-Augmented Generation) 시스템입니다.
  - 블로그 포스팅, 검색, 태그 기반 분류 등 개인 블로그 도메인 기능을 포함합니다.
  - Markdown 기반 문서 관리, AI 기반 요약/검색 등 실험적 기능을 포함합니다.

- **alarm**
  - 개인/회사용 알람 및 일정 관리 MVP입니다.
  - 회사별, 고객별 알림 스케줄 관리, 실시간 알림 기능을 실험합니다.

- **workflow**
  - 프로젝트/업무 프로세스 관리 및 시각화 도구입니다.
  - MCP(Management Control Process) 관련 글 및 실험적 워크플로우 관리 기능을 포함합니다.
  - 노드 기반 프로세스 설계, 상태 전이, 템플릿 관리 등 다양한 워크플로우 패턴을 실험합니다.

- **game**
  - 간단한 보드게임, Three.js 기반 3D 게임 등 다양한 게임 로직을 실험합니다.
  - React/Next.js 환경에서의 게임 상태 관리, UI/UX, 성능 최적화 등을 연습합니다.

- **container**
  - 3D 오브젝트의 움직임, 최적화, 인터랙션을 실험하는 공간입니다.
  - Three.js, React-Three-Fiber 등으로 3D 컨테이너/박스의 이동, 충돌, 애니메이션, 최적화 기법을 테스트합니다.

- **note**
  - 기본적인 CRUD(생성/조회/수정/삭제) 기능을 실습하는 노트 도메인입니다.
  - React Query, 상태관리, 폼 처리 등 실전 패턴을 적용합니다.

---
## 기술 스택

- **React 18** / **Next.js 14+ (App Router)**
- React Query, Zustand
- TypeScript
- Tailwind CSS, shadcn/ui
- Supabase (DB, 인증)
- Lucide-react (아이콘)
- 기타: fetch API, 커스텀 훅, 상태관리(useState/useCallback 등)
- Three.js, React-Three-Fiber (3D)

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
