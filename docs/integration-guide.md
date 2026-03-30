# auth-econovation 통합 가이드

에코노베이션 통합 인증(SSO) 서비스를 연동하는 개발자를 위한 가이드입니다.

---

## 목차

- [서비스 개요](#서비스-개요)
- [로그인 연동](#로그인-연동)
- [회원가입 페이지](#회원가입-페이지)
- [API 명세](#api-명세)
- [에러 코드](#에러-코드)

---

## 서비스 개요

auth-econovation은 에코노베이션 서비스들에게 통합 로그인(SSO)을 제공하는 인증 서버입니다.
OAuth2.0 Provider와 유사한 방식으로 동작하며, 웹과 앱(모바일) 클라이언트를 모두 지원합니다.

**인증 서버 기본 URL**: `https://auth.econovation.kr`

---

## 로그인 연동

### 로그인 페이지 URL

```
https://auth.econovation.kr/?redirect-url=<your-redirect-url>&client-type=<web|mobile>

- `redirect-url`: 로그인 성공 후 리다이렉트할 URL (예: `https://your-service.com/callback`)
- `client-type`: 클라이언트 타입 (선택, 기본값: `web`)

redirect-url의 경우 http:// 또는 https://로 시작하는 절대 URL이어야 합니다. 유효하지 않은 URL일 경우 로그인 페이지에서 오류 메시지가 표시됩니다.
리다이랙시 시 accessToken, accessExpiredTime, refreshToken 이 쿼리 스트링으로 포함됩니다. 이를 통해서 서비스에서 토큰을 수신하여 저장할 수 있습니다.
단 client-type이 web인 경우 refreshToken은 포함되지 않습니다.

```

### 쿼리 파라미터

| 파라미터       | 필수 | 타입                | 설명                                                                      |
| -------------- | ---- | ------------------- | ------------------------------------------------------------------------- |
| `redirect-url` | 필수 | `string`            | 로그인 성공 후 리다이렉트할 URL (`http://` 또는 `https://`로 시작해야 함) |
| `client-type`  | 선택 | `"web" \| "mobile"` | 클라이언트 타입 (기본값: `"web"`)                                         |

### 로그인 흐름

```
1. 사용자가 서비스 내 로그인 버튼 클릭
2. auth-econovation 로그인 페이지로 리다이렉트
3. 사용자가 ID/비밀번호 입력 후 로그인
4. 인증 성공 시 redirect-url로 토큰 전달
```

### 리다이렉트 후 수신 데이터

로그인 성공 시 `redirect-url`에 다음 쿼리 파라미터가 붙어 리다이렉트됩니다.

**웹 클라이언트 (`client-type=web`)**

```
https://your-service.com/callback?accessToken=<token>&accessExpiredTime=<timestamp>
```

**모바일 클라이언트 (`client-type=mobile`)**

```
your-app://callback?accessToken=<token>&accessExpiredTime=<timestamp>&refreshToken=<token>
```

| 파라미터            | 타입     | 설명                                       |
| ------------------- | -------- | ------------------------------------------ |
| `accessToken`       | `string` | JWT 액세스 토큰                            |
| `accessExpiredTime` | `number` | 액세스 토큰 만료 시각 (Unix timestamp)     |
| `refreshToken`      | `string` | 리프레시 토큰 (모바일 클라이언트에만 전달) |

### 연동 예시

#### 웹 서비스 연동

```typescript
// 로그인 페이지로 이동
const authServerUrl = "https://dev.eeos.econovation.kr";
const redirectUrl = encodeURIComponent(
  "https://your-service.com/auth/callback",
);

window.location.href = `${authServerUrl}/?redirect-url=${redirectUrl}&client-type=web`;
```

```typescript
// 콜백 페이지에서 토큰 수신
const params = new URLSearchParams(window.location.search);
const accessToken = params.get("accessToken");
const accessExpiredTime = params.get("accessExpiredTime");

// 토큰을 저장하고 서비스 이용
if (accessToken) {
  localStorage.setItem("accessToken", accessToken);
  // 이후 API 요청 헤더에 Authorization: Bearer <accessToken> 포함
}
```

#### 모바일(앱) 클라이언트 연동

```typescript
const authServerUrl = "https://dev.eeos.econovation.kr";
const redirectUrl = encodeURIComponent("econovation-app://auth/callback");

// WebView 또는 외부 브라우저로 이동
openUrl(`${authServerUrl}/?redirect-url=${redirectUrl}&client-type=mobile`);
```

```typescript
// 딥링크 콜백 처리
// econovation-app://auth/callback?accessToken=...&accessExpiredTime=...&refreshToken=...
const accessToken = getDeepLinkParam("accessToken");
const refreshToken = getDeepLinkParam("refreshToken");
```

### redirect-url 유효성 검사

`redirect-url`은 반드시 `http://` 또는 `https://`로 시작하는 절대 URL이어야 합니다. 유효하지 않은 URL일 경우 로그인 페이지에서 오류 메시지가 표시됩니다.

---

## 회원가입 페이지

회원가입 페이지는 다음 URL에서 접근할 수 있습니다.

```
https://<auth-server>/sign-in
```

> 로그인 페이지 하단의 "회원가입하기" 링크로도 이동 가능합니다.

### 입력 필드

| 필드          | 검증 규칙                      |
| ------------- | ------------------------------ |
| 이름          | 한글만, 최대 5자               |
| 아이디        | 영문/숫자만, 3~20자            |
| 비밀번호      | 특수문자 포함, 8~20자          |
| 비밀번호 확인 | 비밀번호와 동일해야 함         |
| 기수          | 정수, 1~99 범위                |
| 활동 상태     | `am`, `cm`, `rm`, `ob` 중 선택 |

### 활동 상태(activeStatus) 값

| 값   | 설명                         |
| ---- | ---------------------------- |
| `am` | 활동 회원 (Active Member)    |
| `cm` | 수료 회원 (Completed Member) |
| `rm` | 휴면 회원 (Rest Member)      |
| `ob` | OB 회원                      |

---

## API 명세

> 이 섹션은 서비스 내부에서 직접 API를 호출할 때 참고하세요.
> SSO 방식으로 연동하는 경우 [로그인 연동](#로그인-연동)을 참고하세요.

### POST /api/auth/signin

로그인 API입니다.

**요청 헤더**

```
Content-Type: application/json
Client-Type: web | mobile
```

**요청 바디**

```json
{
  "id": "hong123",
  "password": "P@ssw0rd!"
}
```

**응답 (200 OK)**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "accessExpiredTime": 1711800000,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
  },
  "message": "로그인 성공",
  "code": "2000"
}
```

> `refreshToken`은 `Client-Type: mobile`일 때만 포함됩니다.

---

### POST /api/auth/signup

회원가입 API입니다.

**요청 헤더**

```
Content-Type: application/json
```

**요청 바디**

```json
{
  "name": "홍길동",
  "id": "hong123",
  "password": "P@ssw0rd!",
  "generation": 10,
  "activeStatus": "am"
}
```

**응답 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

---

## 에러 코드

### 로그인 에러

| 코드   | 메시지                               |
| ------ | ------------------------------------ |
| `4008` | ID 또는 비밀번호가 일치하지 않습니다 |

### 회원가입 에러

| 코드   | 필드           | 메시지                       |
| ------ | -------------- | ---------------------------- |
| `4100` | `name`         | 이름이 유효하지 않습니다     |
| `4101` | `id`           | 아이디가 유효하지 않습니다   |
| `4102` | `id`           | 이미 사용 중인 아이디입니다  |
| `4103` | `password`     | 비밀번호가 유효하지 않습니다 |
| `4104` | `generation`   | 기수가 유효하지 않습니다     |
| `4105` | `name`         | 이름은 필수 항목입니다       |
| `4106` | `id`           | 아이디는 필수 항목입니다     |
| `4107` | `password`     | 비밀번호는 필수 항목입니다   |
| `4108` | `generation`   | 기수는 필수 항목입니다       |
| `4109` | `activeStatus` | 활동 상태는 필수 항목입니다  |
| `4009` | `id`           | 이미 존재하는 계정입니다     |
| `3001` | `activeStatus` | 서버 응답 메시지 참고        |

### 공통 에러 응답 형식

```json
{
  "status": 400,
  "message": "에러 설명",
  "code": 4008
}
```
