# [배부르면 행복합니다! - 지역 맛집 공유 게시판]

웹서비스설계 JWT 게시판 과제로 구현한 지역 맛집 공유 게시판입니다. 식당의 위치와 실제 방문 후기를 확인하고 싶은 사용자를 대상으로 합니다. 게시글 제목에는 식당 이름을, 내용에는 위치와 후기를 작성해 맛집 정보를 공유합니다. 누구나 목록과 상세 내용을 읽을 수 있으며, 로그인한 사용자는 글을 작성하고 본인이 작성한 글만 수정, 삭제할 수 있습니다.

## 작성자와 서비스 소개

- 학번 / 이름: 202219348 권준성
- 서비스 목적과 대상 사용자: 맛집에 대한 정보를 공유하고 싶은 사용자들을 대상으로 맛집 공유 게시판을 구현하였습니다. 사용자는 식당 이름과 위치, 방문 후기를 게시글의 제목과 본문에 작성하여 다른 사용자에게 공유할 수 있습니다.
- 선택한 기술: Vue 3 / Node.js Express / SQLite(sql.js)
- 주요 기능: 공개 목록·상세 조회, 로그인과 JWT 발급, 내 정보 조회, 게시글 작성·수정·삭제, 작성자 권한 검사, 토큰 만료·오류 안내, 로그아웃

## 보고서와 테스트 증거

- [JWT게시판 구현 보고서 - 202219348 권준성.PDF](</docs/JWT게시판 구현 보고서 - 202219348 권준성.pdf>)
- [테스트 시나리오](/docs/05_테스트시나리오.md)
- [T01~T17 테스트 증거](/docs/evidence/)


## 프로젝트 구조

```text
26WSD-assignment-01
├──  README.md
├── .gitignore
├── frontend-vue/
│    ├── package.json
│    ├── package-lock.json
     └── index.html 
│    ├── vite.config.js
│    └── src/
│       ├── App.vue
│       └── api.js
        └── main.js
        └── style.css
├── backend-express/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── auth.js
│       ├── users.js
        ├── errors.js
│       └── store.js
├── tools/
│   └── check_api.py
└── docs/
    ├── JWT게시판 구현 보고서 - 202219348 권준성.pdf
    ├── 05_테스트시나리오.md
    └── evidence/
```

설치 시 생성되는 `node_modules/`, 빌드 결과 `frontend-vue/dist/`, 실제 설정 `backend-express/.env`, DB `backend-express/data/board.sqlite`는 Git에서 제외합니다.

## 실행 환경

| 항목 | 버전 또는 조건 |
| --- | --- |
| 운영체제, 셸 | Windows 11, Windows CMD |
| Node.js | 22.12 이상 LTS 권장 |
| Vue | 3.5.43 |
| Vite / Vue 플러그인 | 8.3.4 / @vitejs/plugin-vue 6.0.9 |
| Express | 5.3.0 |
| SQLite 라이브러리 | sql.js 1.14.2 |
| JWT / 환경설정 | jsonwebtoken 9.0.3 / dotenv 18.0.7 |
| Python | API 검사 도구 사용 시 필요. 웹서비스 실행에는 불필요 |

의존성은 각 폴더의 `package-lock.json`을 기준으로 `npm ci`로 설치합니다. 실행에는 별도 DB 서버나 클라우드 API가 필요하지 않습니다.

## 설치와 실행

### 1. 저장소 복제

```sh
git clone https://github.com/kwonjunsun9/26WSD-assignment-01.git
cd 26WSD-assignment-01
```

### 2. 백엔드 준비와 실행

저장소 루트에서 CMD로 다음 명령을 실행합니다

```sh
cd backend-express
npm ci
copy .env.example .env
```

다음 명령으로 JWT 서명에 사용할 새 키를 생성합니다.

```sh
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'));"
```

출력된 64자리 16진수 값을 [.env](/backend-express)의 JWT_SECRET에 입력한 후 저장합니다. 실제 키는 소스나 README에 기록하지 않으며, .env는 Git에 포함하지 않습니다.

```sh
JWT_SECRET=<방금 생성한 64자리 16진수 값>
JWT_ISSUER=webservice-class
JWT_AUDIENCE=board-api
TOKEN_TTL=90
DB_FILE=data/board.sqlite
PORT=8000
```

같은 터미널에서 실행합니다.

```sh
npm start
```

백엔드 주소는 `http://127.0.0.1:8000`입니다. 새 터미널에서 다음 명령으로 상태를 확인합니다.

```sh
curl.exe http://127.0.0.1:8000/api/health
```
정상 실행 시 `status`가 `ok`인 응답을 반환합니다.


### 3. 프론트 빌드와 로컬 실행

백엔드를 켜 두고 새 터미널에서 실행합니다.

```sh
cd frontend-vue
npm ci
npm run build
npm run preview
```

- 최종 확인 주소: http://127.0.0.1:4173
- 개발 중 실행: `npm run dev`, http://127.0.0.1:5173
- API 연결 방식 : 브라우저의 `/api` 요청을 Vite 개발·미리보기 프록시가 `http://127.0.0.1:8000`으로 전달합니다.
- 포트 변경: 백엔드는 `.env`의 `PORT`, 프론트는 `vite.config.js`의 `server.port`·`preview.port`를 수정합니다. 백엔드 포트를 바꾸면 두 프록시 목적지도 함께 수정합니다.
- 종료: 프론트와 백엔드를 실행한 각 터미널에서 `Ctrl+C`를 누릅니다
- 코드 변경 후 재실행: 빌드 화면은 `npm run build` 후 `npm run preview`로 다시 확인합니다. 백엔드는 종료 후 `npm start`로 재시작합니다. 개발 중에는 `npm run dev`로 변경을 반영할 수 있습니다.

### 4. 테스트 계정과 DB

| 사용자 | 이메일           | 실습용 비밀번호 |
| ------ | ---------------- | --------------- |
| Alice  | alice@class.test | Classroom!2026  |
| Bob    | bob@class.test   | Classroom!2026  |

위 계정은 과제 전용 테스트 계정입니다. 실제 서비스 계정 정보나 서버 비밀 키를 기록하지 않습니다.

- SQLite 파일 위치와 자동 생성 방식: 백엔드 폴더를 기준으로 `data/board.sqlite`에 자동 생성됩니다. 초기에는 게시글이 없으며, 등록한 게시글은 파일에 저장됩니다. 서버를 재시작해도 같은 DB 파일을 사용하면 게시글이 유지됩니다. `DB_FILE`을 바꾼 경우에는 변경한 경로를 사용합니다.

- DB 초기화 방법: 기본 DB를 초기화하려면 **백엔드를 먼저 종료한 뒤**, `/backend-express`에서 다음 명령을 실행합니다. 기존 게시글이 모두 삭제되므로 초기화가 필요할 때만 수행합니다.

- 서버 재시작 후 데이터 유지 확인 결과: 아래의 명령어를 실행 후 확인할 수 있습니다. 
```sh
del data/board.sqlite
npm start
```

서버 재시작 후 데이터 유지 확인 테스트에 해당하는 자료는 [evidence](/docs/evidence/) 폴더의 `T15*.png` 파일에 정리되어 있습니다.


## 구현 완료 범위

| 기능                       | 완료 여부          | 주요 파일 또는 함수 |
| -------------------------- | ------------------ | ------------------- |
| 공개 목록과 상세           | [완료] |`backend-express/src/app.js`, `frontend-vue/src/App.vue`|
| 로그인과 JWT 발급          | [완료] | `backend-express/src/users.js`, `auth.js`, `frontend-vue/src/api.js` |
| JWT 검증과 내 정보 조회    | [완료] | `backend-express/src/auth.js`, `app.js`|
| 글 작성과 작성자 저장      | [완료] | `backend-express/src/app.js`, `store.js`  |
| 본인 글 수정·삭제          | [완료]| `backend-express/src/auth.js`, `app.js`, `frontend-vue/src/api.js` |
| 토큰 만료와 로그아웃       | [완료] |`backend-express/src/auth.js`, `frontend-vue/src/api.js`, `App.vue` |
| 입력 오류와 권한 오류 처리 | [완료] |  `backend-express/src/app.js`, `frontend-vue/src/App.vue`|

알려진 문제와 미완성 기능: 없음

## 테스트 방법과 결과 요약


백엔드 실행 후 별도 터미널에서 **저장소 루트 기준**으로 실행합니다. Python 추가 패키지는 필요하지 않습니다.

```sh
py tools/check_api.py --mode final
```

만료 검사는 백엔드를 종료하고 `.env`의 `TOKEN_TTL=3`으로 변경한 뒤 서버를 다시 실행하여 확인합니다.

```sh
py tools/check_api.py --mode final --expiry
```

검사가 끝나면 `TOKEN_TTL=90`으로 복원하고 백엔드를 재시작합니다. 검사 도구는 시험용 게시글을 생성하며 정상 완료 시 삭제합니다. 실패하여 남은 시험 글은 해당 작성자로 로그인해 정리합니다.

수동 검사는 [T01~T17의 테스트](/docs/05_테스트시나리오.md)를 따릅니다.

- Alice로 작성·수정·삭제하고, Bob으로 Alice 글 변경을 요청해 `403 FORBIDDEN`과 데이터 불변을 확인합니다.
- 정상 요청의 `200`, 등록의 `201`과 `Location`, 삭제의 `204`와 빈 본문을 확인합니다.
- 입력 오류 `400 BAD_INPUT`, 없는 글 `404 NOT_FOUND`를 확인합니다.
- 보호 API의 토큰 누락·변조·만료에 대한 `401`과 오류 code, `WWW-Authenticate: Bearer`를 확인합니다.
- `4173` 화면에서 로그인·오류 안내·새로고침 후 로그인 해제·서버 재시작 후 게시글 유지를 확인합니다.

현재 `docs/evidence/`에는 T01~T17에 해당하는 캡처 파일이 있습니다. 최종 결과,실행 환경,검사 출력은 보고서에 기록합니다.

## 핵심 구현 설명

1. 로그인과 JWT 발급
   사용자가 로그인하면 [프론트 API 모듈](/frontend-vue/src/api.js)이 이메일과 비밀번호를 서버로 전송합니다. [백엔드 라우트](/backend-express/src/app.js)는 [사용자 모듈](/backend-express/src/users.js)로 계정을 확인하고, 인증에 성공하면 [인증 모듈](/backend-express/src/auth.js)의 issueToken()으로 JWT를 발급합니다.

2. 토큰 보관과 전송
   [프론트 API 모듈](/frontend-vue/src/api.js)은 발급받은 토큰과 사용자 정보를 메모리에 보관합니다. 보호 API 요청에는 Authorization: Bearer <JWT> 헤더를 추가합니다. 토큰을 localStorage나 sessionStorage에 저장하지 않으므로 새로고침하면 로그인 상태가 해제됩니다.

3. 서버의 JWT 검증
   [인증 모듈](/backend-express/src/auth.js)의 currentUserId()는 요청 헤더에서 토큰을 추출하고 HS256 서명, 만료 시각, 발급자, 대상, 사용자 ID와 실제 계정 존재 여부를 검증합니다. 인증에 실패하면 오류 code를 반환하며, [프론트 화면](/frontend-vue/src/App.vue)은 오류에 맞는 메시지를 표시하고 로그인 상태를 해제합니다.

4. 작성자 권한 검사와 데이터 저장
   [백엔드 라우트](/backend-express/src(는 검증된 사용자 ID를 게시글 작성자로 저장합니다.
   수정·삭제 요청에서는 [저장 모듈](/backend-express/src/store.js)로 게시글을 조회하고, [인증 모듈](/backend-express/src/auth.js)의 assertOwner()로 요청 사용자와 작성자를 비교합니다. 
   타인의 요청은 403 FORBIDDEN으로 거부하고, 검사를 통과한 요청만 DB에 반영합니다. [프론트 화면](/frontend-vue/src/App.vue)에서도 canEdit()를 사용해 본인 글에만 수정·삭제 버튼을 표시합니다.

상세 코드와 테스트 결과는 [JWT게시판 구현 보고서 - 202219348 권준성.PDF](</docs/JWT게시판 구현 보고서 - 202219348 권준성.pdf>)에 작성합니다.

## AI 활용 요약과 참고 자료

- AI 사용 여부: 사용
- 도구와 사용 목적: ChatGPT를 활용했습니다. 세부 사용 목적은 보고서의 활용 사례에 정리하였습니다.
- 반영 위치와 직접 수정·검증한 내용: 로그인 처리와 브라우저 콘솔 테스트 요청에 반영했습니다. 예시를 기존 코드와 비교하여 수정하고, 실제 요청으로 정상 인증과 토큰 누락, 변조, 만료의 오류 구분, 로그인 상태 처리, 타인 글 수정, 삭제 거부 및 데이터 불변을 확인했습니다.
- 상세 활용 기록: [구현 보고서](</docs/JWT게시판 구현 보고서 - 202219348 권준성.pdf>) - 05 AI 활용과 참고 자료의 사례 1~3에 요청 내용, 제안 내용, 실제 반영 위치와 직접 검증한 결과를 기록했습니다.
- 참고한 수업 자료·외부 코드·공식 문서
<br/> 6주차_JWT_로그인과 인증.html: JWT 발급·검증, 브라우저 메모리 저장, Bearer 헤더 전송 방식을 참고했습니다. 
<br/>[auth.js](/backend-express/src/auth.js)의 issueToken()·currentUserId()와 [api.js](/frontend-vue/src/api.js)의 login()·authorizationHeaders()에 적용했습니다.
<br/> 7주차_JWT_접근제어와_Swagger.html: 인증된 사용자와 DB 작성자를 비교하는 권한 검사 방식과 401·403의 차이를 참고했습니다. 
<br/>[auth.js](/backend-express/src/auth.js)의 assertOwner()에 적용하고, 타인의 변경 요청이 거부된 뒤 원문이 유지되는지 확인했습니다.


## 제출 확인

- [x] README의 안내 문구를 실제 내용으로 교체했다.
- [x] 새 폴더에 clone하여 README만으로 설치·환경설정·빌드·로컬 실행했다.
- [x] 4173번 빌드 화면에서 API 연결과 전체 필수 기능을 확인했다.
- [x] GitHub에서 보고서와 증거 링크가 열린다.
- [x] 교수자가 저장소를 열람·복제할 수 있다.
- [x] 비밀 키·실제 토큰·DB·node_modules·.venv·target을 커밋하지 않았다.
- [x] 최종 push 후 저장소 URL과 제출 기준 커밋 SHA를 LMS에 제출했다.
