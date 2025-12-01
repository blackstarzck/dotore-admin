# Git Commit Convention 가이드

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/) 스타일을 따릅니다.

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Husky 초기화 (처음 한 번만)

```bash
npm run prepare
```

### 3. Git Commit Template 설정 (선택사항)

```bash
git config commit.template .gitmessage
```

또는 전역으로 설정:

```bash
git config --global commit.template .gitmessage
```

## Commit Message 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- **refactor**: 코드 리팩토링
- **perf**: 성능 개선
- **test**: 테스트 코드 추가/수정
- **chore**: 빌드 업무 수정, 패키지 매니저 설정 등
- **design**: CSS 등 사용자 UI 디자인 변경
- **ci**: CI 설정 파일 수정

### Scope (선택사항)

변경 범위를 명시합니다:

- `pages`: 페이지 컴포넌트
- `components`: 재사용 가능한 컴포넌트
- `utils`: 유틸리티 함수
- `context`: Context API
- `themes`: 테마 설정
- `types`: TypeScript 타입 정의

### Subject (필수)

- 50자 이내로 간결하게 작성
- 명령형으로 작성 (과거형 X)
- 첫 글자는 대문자로 시작하지 않음
- 마지막에 마침표(.)를 붙이지 않음

### Body (선택사항)

- 72자마다 줄바꿈
- 무엇을, 왜 변경했는지 설명

### Footer (선택사항)

- 이슈 트래커 ID 참조
- 예: `Fixes #123`, `Closes #456`

## 예시

### 간단한 커밋

```bash
git commit -m "feat: add dark mode toggle button"
git commit -m "fix: resolve navigation issue in sidebar"
```

### Scope 포함

```bash
git commit -m "feat(pages): add inquiry list page"
git commit -m "fix(components): prevent duplicate popover rendering"
```

### Body 포함

```bash
git commit -m "feat(utils): add multilingual content support

Add MultilingualContent interface and utility functions
to support Korean, English, and Vietnamese content."
```

### Footer 포함

```bash
git commit -m "fix(components): resolve hydration error in dialog

Add component=\"div\" prop to Typography elements
within DialogTitle to prevent invalid HTML nesting.

Fixes #123"
```

## 자동 검증

이 프로젝트는 `commitlint`와 `husky`를 사용하여 커밋 메시지를 자동으로 검증합니다.

커밋 메시지가 컨벤션을 따르지 않으면 커밋이 거부됩니다.

### 수동 검증

```bash
npm run commitlint
```

## Git Commit Template 사용

`.gitmessage` 파일을 Git commit template으로 설정하면, 커밋 시 자동으로 템플릿이 표시됩니다.

설정 후 `git commit`만 입력하면 템플릿이 자동으로 열립니다.

## 문제 해결

### Husky가 작동하지 않는 경우

```bash
npm run prepare
```

### Commitlint가 작동하지 않는 경우

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitlint Documentation](https://commitlint.js.org/)
