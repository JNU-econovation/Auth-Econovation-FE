---
title: econo-passport 사용 가이드
description: Spring Boot 마이크로서비스에서 @PassportAuth 어노테이션으로 인증·인가를 처리하는 법 — 설치, 빠른 시작, 패턴별 사용 예시, Passport 객체·어노테이션 레퍼런스
---

# econo-passport 사용 가이드

econo-passport는 에코노베이션 내부 서비스가 게이트웨이에서 전달받은 회원 정보를 컨트롤러 파라미터 하나로 받아 쓰게 해주는 Spring Boot 공용 라이브러리입니다.

게이트웨이는 SSO 토큰을 검증한 뒤, 회원 정보를 `X-User-Passport` 헤더에 담아 내부 서비스로 보냅니다([API Gateway 동작 원리](./gateway) 참고). 이 헤더를 매번 직접 디코딩·파싱·검증하는 대신, 컨트롤러 메서드에 `@PassportAuth Passport passport`만 붙이면 라이브러리가 헤더를 파싱해 `Passport` 객체로 주입합니다.

이 문서를 읽고 나면 라이브러리를 설치하고, 컨트롤러에서 회원 정보를 꺼내 쓰고, 역할 기반 인가를 적용할 수 있습니다.

## 동작 개요

요청은 다음 흐름으로 컨트롤러에 도달합니다.

```
클라이언트
  │  Authorization: Bearer <AccessToken>
  ▼
API Gateway  ─ JWT 검증, Passport 생성
  │  X-User-Passport: <Base64(JSON)>
  ▼
내부 서비스 (econo-passport)
  │  PassportArgumentResolver가 헤더를 자동 파싱
  ▼
@PassportAuth Passport passport  ← 컨트롤러 메서드 파라미터로 주입
```

개발자가 직접 다룰 것은 `@PassportAuth` 어노테이션과 `Passport` 객체뿐입니다. 헤더 이름, Base64 디코딩, 만료 검증, 권한 검증은 라이브러리가 처리합니다.

## 설치

### 1. JitPack 저장소 등록

`build.gradle.kts`(또는 `settings.gradle.kts`)의 `repositories`에 JitPack을 추가합니다.

```kotlin
repositories {
    mavenCentral()
    maven { url = uri("https://jitpack.io") }
}
```

### 2. 의존성 추가

```kotlin
dependencies {
    implementation("com.github.JNU-econovation:econo-passport:1.0.3")
}
```

### 3. 자동 설정 확인

Spring Boot 2.x·3.x 모두 자동 설정됩니다. `PassportArgumentResolver`가 자동으로 등록되므로 의존성만 추가하면 바로 사용할 수 있습니다.

`@EnableWebMvc`로 기본 설정을 덮어쓴 경우에만 아래와 같이 직접 등록합니다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired private PassportArgumentResolver passportArgumentResolver;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(passportArgumentResolver);
    }
}
```

## 빠른 시작

컨트롤러 메서드 파라미터에 `@PassportAuth Passport passport`를 추가합니다.

```java
@RestController
public class MyController {

    @GetMapping("/api/programs")
    public ResponseEntity<List<Program>> getMyPrograms(@PassportAuth Passport passport) {
        Long memberId = passport.getMemberId();
        String name = passport.getName();
        return ResponseEntity.ok(programService.findByMemberId(memberId));
    }
}
```

라이브러리가 `X-User-Passport` 헤더를 자동으로 `Passport` 객체로 변환해 주입합니다. 헤더가 없거나 만료되었거나 형식이 잘못되면 라이브러리가 401/403 예외를 발생시킵니다. 예외를 응답으로 변환하는 방법은 [예외 처리](#예외-처리)를 참고하세요.

## 인증·인가 패턴

아래 패턴은 `@PassportAuth`의 옵션 조합으로 구현합니다. 전체 옵션 목록은 [@PassportAuth 어노테이션 옵션](#passportauth-어노테이션-옵션) 레퍼런스를 참고하세요.

### 로그인 사용자만 허용 (기본)

옵션 없이 붙이면 로그인한 사용자만 통과합니다.

```java
@GetMapping("/api/me")
public Response me(@PassportAuth Passport passport) { ... }
```

### 특정 역할 요구

`requiredRoles`로 필요한 역할을 지정합니다. 여러 개를 지정하면 기본은 OR 조건이며, `requireAllRoles = true`로 설정하면 AND 조건이 됩니다.

```java
// ADMIN 필수
@PassportAuth(requiredRoles = "ADMIN") Passport passport

// ADMIN 또는 MANAGER (OR)
@PassportAuth(requiredRoles = {"ADMIN", "MANAGER"}) Passport passport

// ADMIN 그리고 SUPER_USER 둘 다 (AND)
@PassportAuth(requiredRoles = {"ADMIN", "SUPER_USER"}, requireAllRoles = true) Passport passport
```

### 역할 계층 적용

역할 계층은 `SUPER_ADMIN > ADMIN > MANAGER > USER`로 고정되어 있습니다. `includeHigherRoles = true`로 설정하면 상위 역할도 자동으로 허용됩니다. 예를 들어 MANAGER를 요구할 때 ADMIN과 SUPER_ADMIN도 함께 허용됩니다.

```java
@PassportAuth(requiredRoles = "MANAGER", includeHigherRoles = true) Passport passport
```

> 커스텀 역할(`SUPER_USER` 등)은 이 계층에 포함되지 않습니다. 계층 인정은 고정된 4개 역할에만 적용됩니다.

### 선택적 인증 (비로그인 허용)

비로그인 사용자도 호출할 수 있는 엔드포인트에서 `required = false`를 사용합니다.

```java
@GetMapping("/api/public/programs")
public Response getPrograms(@PassportAuth(required = false) Passport passport) {
    if (passport != null) {
        return programService.forMember(passport.getMemberId());
    }
    return programService.publicOnly();
}
```

> ⚠️ `required = false`이면 `passport`가 `null`일 수 있습니다. 사용하기 전에 반드시 null을 확인하세요.

### 리소스 소유자 접근 제어

URL의 path variable과 Passport를 함께 검사할 때는 `condition`에 SpEL(Spring Expression Language) 표현식을 작성합니다. 본인 리소스이거나 관리자일 때만 통과시키는 예시입니다.

```java
@GetMapping("/api/members/{targetId}/secret")
@PassportAuth(condition = "passport.memberId == #targetId or passport.isAdmin()")
public Response getSecret(@PathVariable Long targetId, @PassportAuth Passport passport) { ... }
```

### 만료 검증 비활성화 (드문 경우)

`validateExpiry = false`는 Passport의 만료 시각 검증을 끕니다. 장기 실행 배치나 디버깅 용도로만 사용합니다.

```java
// ⚠️ 일반 트래픽에서는 끄지 마세요. 만료된 Passport가 통과합니다.
@PassportAuth(validateExpiry = false) Passport passport
```

## 예외 처리

검증에 실패하면 라이브러리는 `PassportException`을 발생시킵니다. `@RestControllerAdvice`에서 한곳에 모아 처리하세요.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PassportException.class)
    public ResponseEntity<ErrorResponse> handlePassport(PassportException e) {
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
    }
}
```

발생하는 에러 코드는 다음과 같습니다.

| 에러 코드               | HTTP 상태 | 발생 상황                |
| ----------------------- | --------- | ------------------------ |
| `AUTH_UNAUTHORIZED`     | 401       | 인증 실패 (헤더 없음 등) |
| `AUTH_TOKEN_EXPIRED`    | 401       | Passport 만료            |
| `AUTH_PASSPORT_INVALID` | 401       | Passport 구조 오류       |
| `AUTH_FORBIDDEN`        | 403       | 권한 부족                |
| `AUTH_BAD_REQUEST`      | 400       | 잘못된 요청 형식         |

> 보호된 경로(`/api/**`)는 토큰이 없으면 게이트웨이가 이미 401로 차단합니다. 따라서 이 예외 처리는 주로 **만료**, **권한 부족**, **헤더 위변조** 케이스를 처리합니다.

## 테스트 작성

통합 테스트에서는 `X-User-Passport` 헤더를 직접 만들어 주입합니다. `Passport`를 생성해 Base64로 인코딩한 값을 헤더에 담으면 됩니다.

```java
@Test
void getPrograms_returns_user_programs() throws Exception {
    Passport mock = new Passport(
            123L, "testuser", "테스터",
            30, "AM",
            List.of("USER"),
            LocalDateTime.now(),
            LocalDateTime.now().plusHours(1)
    );

    String header = Base64.getEncoder().encodeToString(
            objectMapper.writeValueAsBytes(mock)
    );

    mockMvc.perform(get("/api/programs")
                    .header("X-User-Passport", header))
            .andExpect(status().isOk());
}
```

테스트 헬퍼로 빼두면 매번 인코딩 보일러플레이트를 반복하지 않아도 됩니다.

```java
public static String passportHeader(Long memberId, String... roles) {
    Passport p = new Passport(
            memberId, "user" + memberId, "Test",
            30, "AM",
            List.of(roles),
            LocalDateTime.now(),
            LocalDateTime.now().plusHours(1));
    return Base64.getEncoder().encodeToString(toJson(p).getBytes());
}
```

## 트러블슈팅

**`@PassportAuth`를 붙였는데 항상 `null`이 들어옵니다.**

- `@EnableWebMvc`를 직접 선언하면 Spring Boot의 자동 설정이 꺼집니다. [설치 3단계](#_3-자동-설정-확인)를 참고해 수동으로 등록하세요.
- 요청이 게이트웨이를 거치지 않고 서비스에 직접 도달하면 헤더가 없습니다. 로컬에서 단독 실행한다면 [테스트 헤더](#테스트-작성)를 수동으로 주입하세요.

**401 `AUTH_TOKEN_EXPIRED`가 자주 발생합니다.**

- JWT 자체는 게이트웨이가 검증하므로 만료 시 게이트웨이가 먼저 차단합니다. 이 예외가 내부 서비스에서 발생한다면 Passport JSON의 `expiresAt`이 만료된 것입니다. JWT의 `exp`와 Passport의 `expiresAt`이 일치하는지 게이트웨이 설정을 확인하세요.

**`includeHigherRoles`를 켰는데도 상위 역할이 통과되지 않습니다.**

- 역할 문자열의 대소문자를 확인하세요. `Admin`이 아니라 `ADMIN`이어야 합니다.
- 역할 계층은 `SUPER_ADMIN > ADMIN > MANAGER > USER`로 고정되어 있습니다. 커스텀 역할(`SUPER_USER` 등)은 이 계층에 포함되지 않습니다.

## 레퍼런스

처음 도입할 때보다 반복 참조할 때 활용하는 명세입니다.

| 항목     | 값                                                                            |
| -------- | ----------------------------------------------------------------------------- |
| GitHub   | [JNU-econovation/auth-common](https://github.com/JNU-econovation/auth-common) |
| 배포     | JitPack                                                                       |
| 라이선스 | MIT                                                                           |

### 게이트웨이와 라이브러리의 책임 경계

토큰 검증과 신원 정보 주입은 게이트웨이가, 헤더 해석과 인가 판정은 라이브러리가 담당합니다.

| 구간                                                    | 담당               |
| ------------------------------------------------------- | ------------------ |
| JWT 서명·만료 검증, JWKS 조회, 미인증 요청 401 차단     | **게이트웨이**     |
| JWT → Passport 변환, `X-User-Passport` 헤더 부착        | **게이트웨이**     |
| Base64 디코딩 → JSON 파싱 → `Passport` 객체 생성        | **econo-passport** |
| `@PassportAuth` 옵션 기반 권한·만료 검증, 파라미터 주입 | **econo-passport** |

### Passport 객체

게이트웨이가 JWT 클레임으로부터 만들어 보내는 회원 정보 컨테이너입니다.

| 필드         | 타입            | 설명                                                     |
| ------------ | --------------- | -------------------------------------------------------- |
| `memberId`   | `Long`          | 회원 PK                                                  |
| `loginId`    | `String`        | 로그인 아이디                                            |
| `name`       | `String`        | 회원 이름                                                |
| `generation` | `Integer`       | 기수                                                     |
| `status`     | `String`        | 활동 상태 (`AM` / `RM` / `CM` / `OB`)                    |
| `roles`      | `List<String>`  | 역할 목록 (`USER` / `MANAGER` / `ADMIN` / `SUPER_ADMIN`) |
| `issuedAt`   | `LocalDateTime` | 발급 시각                                                |
| `expiresAt`  | `LocalDateTime` | 만료 시각                                                |

`status` 값의 의미는 다음과 같습니다.

| 값   | 의미 |
| ---- | ---- |
| `AM` | 활동 |
| `RM` | 수습 |
| `CM` | 전산 |
| `OB` | 졸업 |

### 유틸리티 메서드

값을 직접 꺼내 분기하기보다 아래 메서드를 사용하는 편이 가독성과 일관성에 좋습니다.

| 메서드                   | 반환      | 설명                                           |
| ------------------------ | --------- | ---------------------------------------------- |
| `isAdmin()`              | `boolean` | ADMIN 역할 보유 여부                           |
| `isManager()`            | `boolean` | MANAGER 역할 보유 여부                         |
| `hasRole(String)`        | `boolean` | 특정 역할 보유 여부                            |
| `hasAnyRole(String...)`  | `boolean` | OR 조건 — 하나라도 보유                        |
| `hasAllRoles(String...)` | `boolean` | AND 조건 — 모두 보유                           |
| `isValid()`              | `boolean` | 구조적 유효성 (`memberId` 등 필수 데이터 존재) |
| `isExpired()`            | `boolean` | 시간 기반 만료 여부                            |
| `isActive()`             | `boolean` | 유효하고 만료되지 않음 (종합 검증)             |
| `isMember(Long)`         | `boolean` | `memberId`가 인자와 같은지                     |
| `canAccessMember(Long)`  | `boolean` | 본인이거나 ADMIN인지 (리소스 소유권 검증용)    |

### @PassportAuth 어노테이션 옵션

| 옵션                 | 타입       | 기본값  | 설명                                                      |
| -------------------- | ---------- | ------- | --------------------------------------------------------- |
| `required`           | `boolean`  | `true`  | Passport 필수 여부. `false`면 비로그인 허용 (`null` 가능) |
| `validateExpiry`     | `boolean`  | `true`  | 만료 시각 검증 여부                                       |
| `requiredRoles`      | `String[]` | `{}`    | 필요한 역할 목록                                          |
| `requireAllRoles`    | `boolean`  | `false` | `true`면 AND, `false`면 OR 조건                           |
| `includeHigherRoles` | `boolean`  | `false` | 역할 계층 인정 여부                                       |
| `condition`          | `String`   | `""`    | SpEL 조건 표현식                                          |

## 관련 문서

- [API Gateway 동작 원리](./gateway) — `X-User-Passport` 헤더가 주입되기까지의 메커니즘
- [API 명세](./api-reference) — SSO 백엔드 엔드포인트 계약
