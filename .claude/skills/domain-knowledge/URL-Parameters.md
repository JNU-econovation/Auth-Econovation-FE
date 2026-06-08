## URL Parameters

### client-id (필수)

- 사전에 등록했던 리다이렉트 uri에 해당하는 client-id
- SSO 페이지 URL에 query string으로 전달됨.

### client-type (선택)

- 클라이언트 타입을 구분하는 파라미터
- 가능한 값: `"web"` | `"app"`
- 기본값: `"web"`
- 웹 서비스면 "web", 앱 서비스의 웹뷰면 "app"
- 예: `auth.econovation.kr?redirect=https://...&client_type=app`
