## 인증 플로우 (Authentication Flow)

### 웹 클라이언트 (client-type == "web")

1. 사용자가 `auth.econovation.kr`에서 로그인
2. 로그인 인증 성공시 서버가 과거에 등록했던 클라이언트의 리다이렉트 주소 서비스 페이지로 즉시 리다이렉트
3. 리다이렉트와 동시에 서버가 쿠키로 AT(Access Token), RT(Refresh Token) 전달
4. AT, RT를 가진 사용자는 모든 에코노베이션 서비스에 Free Pass

### 앱 클라이언트 (client-type == "app")

1. 사용자가 앱 내 웹뷰에서 `auth.econovation.kr`로 로그인
2. 로그인 인증 성공시 서버가 과거에 등록했던 클라이언트의 리다이렉트 주소 서비스 페이지로 즉시 리다이렉트
3. 리다이렉트와 동시에 서버가 body로 AT(Access Token), RT(Refresh Token) 전달
4. 앱 내에서 자체적으로 리다이렉트된 곳에서 AT, RT를 적절하게 가공 / 사용
