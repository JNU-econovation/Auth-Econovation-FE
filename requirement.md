## 최종 목표

- 에코노베이션 서비스들에게 회원 정보 제공 및 통합 로그인을 가능하도록 구현한다.

## 요구사항

1. 웹의 경우, 로그인하면 **쿠키**로 **at, rt**를 넣는다.
2. (앱의 경우) OAuth2.0 처럼, `authorization_code` 를 발급해서, 프론트가 임시토큰을 가지고, AT를 발급받는 방식. (로그인 요청시 타입을 추가로 전달해야한다.)
    
    ⇒ 사용자가 로그인하는 화면은 `auth.econovation.kr` 이기 때문에
    
3. `임시 코드` 를 발급 받아서, AT,RT를 발급받는다. (body로 전달받는다.)
4. AT,RT만 발급 받으면, 모든 서비스 Free Pass

**주의**

- 로그인 요청할 때, Web / App 인지 구분하도록 해야함
    
    → Client 등록, ClientID , Client Secret 전부 등록하고 발급하는 방식으로 해야 할 듯
    
    Client 등록할 때, Web / App 인지 구분하도록 하면 될 듯
    

- 웹
    - 토큰 : AT , AT 만료시간 , RT 모두 쿠키
    - `authorization_code` 를 발급하지 않고, 쿠키에 삽입과 동시에 원래 서비스 Page로 Redirect

- 앱
    - 토큰 : AT , AT 만료시간 , RT 모두 Body
    - `authorization_code` 를 발급받고, OAuth2.0 처럼 프론트가 다시 인증서버로 요청해서,
        
        AT, RT 를 발급받는다.
        

⇒ 사실 상 그냥 OAuth2.0 Provider 를 구축하는 것

## 요구사항 분석

- 웹 기반으로 동작해야한다.
- SSO 페이지 url에는 redirect query string이 존재해야한다. 이를 직접 가져올 수 있어야 한다.
- SSO 페이지 url에는 client_type이 존재할 수 있다. 이를 직접 가져올 수 있어야 한다.
- 사용자는 id와 pw를 입력할 수 있다.
- 폼 제출시 클라이언트는 client_type 을 함께 전달할 수 있다. 이는 웹 서비스라면 web, 앱서비스에서 띄운 웹뷰라면 app을 넣어줘야한다.
    - 해당 필드를 넣지 않은 경우 기본적으로 web으로 동작해야한다.
- 폼 제출시 서버와 통신하여 사용자의 유효성을 검증한다. 이에 대한 응답으로 아래와 같은 동작을 기대하고 대응해야한다.
    - client_type == “web” : 쿠키로 AT, RT를 전달받는다.
    - client_type == “app” : body로 일회성 토큰을 전달받는다.
- 응답을 올바르게 받은 경우 redirect query string 주소로 리다이랙트 한다. 이때 client_type == “app”인 경우 `${redirect query string}?${?code="token"}` 로 리다이랙트한다.
- 응답을 올바르게 받지 않은 경우 헬퍼 메시지로 에러 메시지를 표시한다.