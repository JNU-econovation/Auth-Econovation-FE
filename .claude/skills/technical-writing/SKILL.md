---
name: technical-writing
description: 기술 문서(튜토리얼, How-to 가이드, 트러블슈팅, API 참조, 개념·도메인 설명 등)를 새로 작성하거나 기존 문서를 개선·리뷰할 때 이 스킬을 사용하세요. 토스 테크니컬 라이팅 가이드 기반의 3단계 워크플로우(문서 유형 → 정보 구조 → 문장 다듬기)로 전문 에이전트를 호출해 문서 품질을 끌어올립니다. apps/docs 등 .md 문서 작성·검토 시 활성화하세요.
---

# 테크니컬 라이팅 워크플로우

이 스킬은 **토스 테크니컬 라이팅 가이드**(`context/technical-writing/`)를 기반으로, 기술 문서를 작성·개선하는 3단계 파이프라인을 오케스트레이션합니다. 각 단계는 전용 서브 에이전트가 담당합니다.

## 활성화 시점

- 새 기술 문서(튜토리얼·가이드·참조·설명 등)를 작성할 때
- 기존 문서(특히 `apps/docs/**`)를 개선·리뷰할 때
- 문장이나 문단을 더 명확·간결하게 다듬어 달라는 요청을 받았을 때

## 3단계와 담당 에이전트

| 단계 | 목적 | 담당 에이전트 | 참조 문서 |
| --- | --- | --- | --- |
| **Step 1. 문서 유형 정하기** | 독자 목적에 맞는 유형(학습/문제해결/참조/설명) 결정, 템플릿·구조 제안 | `tw-type-classifier` | `context/technical-writing/type/**`, `tutorial/structure.md` |
| **Step 2. 정보 구조 만들기** | 제목·개요·섹션 배치·일관성 등 정보 구조 진단·개선 | `tw-structure-reviewer` | `context/technical-writing/architecture/**` |
| **Step 3. 문장 다듬기** | 주체·간결성·구체성·자연스러운 한국어·일관성으로 문장 교정 | `tw-sentence-polisher` | `context/technical-writing/sentence/**` |

> 각 에이전트는 작업 시작 시 자신의 참조 문서를 **직접 읽어** 최신 기준에 근거합니다. 원본이 항상 우선이며, 에이전트 내부 요약은 보조용입니다.

## 작업별 실행 경로

요청 성격에 따라 필요한 단계만 골라 Agent 도구로 호출하세요. 독립적이지 않고 **앞 단계 결과가 뒤 단계 입력이 되므로 순차 실행**합니다.

### A. 새 문서를 처음부터 작성
1. `tw-type-classifier` 호출 → 문서 유형 확정 + 템플릿/구조 확보
2. 그 골격으로 **초안 작성** (이 단계는 메인 작업)
3. `tw-structure-reviewer` 호출 → 초안의 정보 구조 점검·개선
4. `tw-sentence-polisher` 호출 → 문장 다듬기
5. 결과를 종합해 최종본 제시

### B. 기존 문서 개선 (유형은 적절)
1. `tw-structure-reviewer` 호출 → 구조 진단·개선
2. `tw-sentence-polisher` 호출 → 문장 교정
3. 종합

### C. 문장·문단만 다듬기
1. `tw-sentence-polisher` 호출

### D. 문서 유형/구성이 적절한지 점검
1. `tw-type-classifier` 호출 (필요 시 `tw-structure-reviewer` 병행)

### E. 여러 페이지로 된 문서 세트 설계
1. `tw-type-classifier` 호출 → 디렉터리 트리·유형 배치·크로스링크 설계

## 호출 방법

Agent 도구에 `subagent_type`으로 위 에이전트 이름을 지정하고, prompt에 **대상 텍스트(또는 파일 경로)와 맥락**(문서 목표·독자 수준·제약)을 함께 전달하세요. 파일을 수정해야 하면 대상 파일 경로를 명시해 에이전트가 직접 Edit 하도록 합니다.

예시:
```
Agent(subagent_type: "tw-structure-reviewer",
      prompt: "apps/docs/developers/quick-start.md 의 정보 구조를 진단하고 개선안을 제시해줘. 독자는 처음 연동하는 외부 개발자야.")
```

## 운영 원칙

- **순서 존중**: 유형 → 구조 → 문장 순으로 진행하면 큰 결정을 먼저 내리고 세부를 나중에 다듬게 되어 재작업이 줄어듭니다.
- **권장 사항**: 가이드의 모든 원칙은 강제 규칙이 아니라 권장입니다. 문서 성격에 맞게 유연하게 적용하세요.
- **코드가 진실**: `apps/docs/`를 다룰 때는 [docs-knowledge](../docs-knowledge/SKILLS.md) 규칙을 따릅니다. 코드와 문서가 충돌하면 코드를 따릅니다.
- **혼자 작업할 때**: 서브 에이전트 없이 직접 다듬어야 한다면 `context/technical-writing/tutorial/review-prompt.md`의 단계별 프롬프트·체크리스트를 참고하세요.
- **이모지·과장 자제**: 정보 전달에 집중하고, 어미(해요체/합쇼체)는 문서 안에서 일관되게 유지합니다.
