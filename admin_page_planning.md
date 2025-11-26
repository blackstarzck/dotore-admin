# [기획서] 관리자 문의 관리 시스템 (Admin Inquiry System)



## 1. 프로젝트 개요

사용자(학생, 강사, 제휴)로부터 접수된 문의를 효율적으로 관리하고, 데이터를 분석하여 시각화하는 관리자 전용 웹 시스템입니다.



## 2. 사이트 구조 (Site Map)

1.  **로그인 (Login)**: 관리자 인증 및 진입

2.  **문의 목록 (Inquiry List)**: 문의 조회, 상세 확인, 답변 처리 (메인 페이지)

3.  **문의 분석 (Inquiry Analysis)**: 기간별, 유형별 문의 통계 대시보드



## 3. 상세 기능 요구사항



### 3.1 로그인 페이지

*   **기능**: 관리자 계정 아이디/비밀번호 인증

*   **구성**: 로고, ID/PW 입력 폼, 로그인 버튼



### 3.2 문의 목록 페이지 (Inquiry List)

*   **상단 현황판 (Status Summary)**:

    *   **미답변 문의**: <span style="color:red">건수 강조</span> (클릭 시 미답변 필터링)

    *   오늘 접수 건수

    *   전체 누적 문의 건수

*   **문의 목록 테이블 (Data Table)**:

    *   **필터**: 카테고리(학습, 결제, 강사, 콘텐츠, AI챗봇, 테스트 관련, 대시보드 관련, 강사 지원 관련, 패키지/이벤트 관련), 처리상태(미답변/답변완료), 기간, **국적**

    *   **컬럼(Columns)**:

        1.  **카테고리**: 학습, 결제, 강사, 콘텐츠, AI챗봇, 테스트 관련, 대시보드 관련, 강사 지원 관련, 패키지/이벤트 관련

        2.  **작성자 정보**: ID, 이메일, **국적**, **유형(학생/강사/제휴)**

        3.  **문의 내용**: 제목, 메시지(한 줄 미리보기), **첨부파일 유무(아이콘)**

        4.  **등록일**: YYYY-MM-DD HH:mm

        5.  **답변 정보**: 답변자 ID, 답변일 (답변 완료된 경우만 표시)

*   **상세 및 답변 (Modal)**:

    *   **동작**: 테이블 행(Row) 클릭 시 모달 팝업 오픈

    *   **내용**: 문의 상세 내용(전체 본문), **작성자 국적 정보**, 첨부파일 다운로드/확인

    *   **답변 기능**: 답변 내용 입력(Textarea), '답변 등록' 버튼

    *   **처리**: 답변 등록 시 상태가 '답변완료'로 변경되고 목록 갱신



### 3.3 문의 분석 페이지 (Inquiry Analysis)

*   **기간별 추이 (Line Chart)**:

    *   탭(Tab) 선택: **일별 / 주간별 / 월별**

    *   문의 접수량 변화 추이 그래프

*   **현황 분석 (Pie/Bar Chart)**:

    *   **카테고리별**: 어떤 문의가 가장 많은지 비율 확인
        *   **카테고리 옵션**: 학습, 결제, 강사, 콘텐츠, AI챗봇, 테스트 관련, 대시보드 관련, 강사 지원 관련, 패키지/이벤트 관련

    *   **작성자 유형별**: 학생, 강사, 제휴 사용자 그룹별 문의 비중

    *   **인구통계 분석**:

        *   **성별**: 남성/여성 비율

        *   **국가별**: 사용자 국가 분포

        *   **연령대별**: 10대, 20대, 30대 등 연령 분포



## 4. 데이터 모델 (Data Schema)



### 4.1 문의 (Inquiry)

| 필드명 | 타입 | 설명 |

| :--- | :--- | :--- |

| `id` | String | 고유 ID |

| `category` | Enum | **카테고리 옵션**: Learning(학습), Payment(결제), Instructor(강사), Content(콘텐츠), AI_Chatbot(AI챗봇), Test(테스트 관련), Dashboard(대시보드 관련), InstructorSupport(강사 지원 관련), PackageEvent(패키지/이벤트 관련) |

| `user_type` | Enum | **Student, Instructor, Partner** |

| `user_id` | String | 작성자 ID |

| `user_email` | String | 작성자 이메일 |

| `user_gender` | Enum | **Male, Female, Other** |

| `user_country` | String | 국가 코드 (e.g., KR, US) |

| `user_age` | Integer | 나이 |

| `title` | String | 문의 제목 |

| `content` | Text | 문의 본문 |

| `has_attachment`| Boolean| 첨부파일 유무 |

| `created_at` | DateTime | 등록일시 |

| `status` | Enum | **Pending(미답변), Answered(답변완료)** |

| `answer_content`| Text | 답변 내용 |

| `answerer_id` | String | 답변자 ID |

| `answered_at` | DateTime | 답변일시 |

## 5. 디자인 및 UI/UX 가이드 (Design Guidelines)

본 프로젝트의 UI/UX 디자인은 **Mantis Dashboard** 템플릿을 기반으로 구현합니다.

### 5.1 전체 레이아웃 및 테마 (Global Layout & Theme)
*   **참고 사이트**: [Mantis Dashboard - Analytics](https://mantisdashboard.com/dashboard/analytics)
*   **주요 특징**:
    *   **Sidebar Navigation**: 좌측 고정형 사이드바 (Persistent Drawer), 로고 상단 배치, 직관적인 메뉴 아이콘.
    *   **Header (AppBar)**: 깔끔한 흰색 배경, 하단 경계선, 우측 사용자 프로필 영역.
    *   **Color Palette**: Mantis 기본 테마 색상(Blue/Grey 계열) 사용.
    *   **Background**: 메인 콘텐츠 영역에 회색(`grey.100`) 배경을 적용하여 카드형 콘텐츠와 구분.

### 5.2 데이터 테이블 디자인 (Data Table Design)
*   **참고 사이트**: [Mantis Dashboard - Customer List](https://mantisdashboard.com/tables/mui-table/basic)
*   **적용 페이지**: 문의 목록 (Inquiry List)
*   **주요 특징**:
    *   **Card Container**: 전체 콘텐츠(탭, 필터, 테이블)를 하나의 `Paper` 컴포넌트(Card 형태)로 감싸서 통합.
    *   **Tab Menu**: 카드 최상단에 상태별(전체, 미답변, 답변완료) 탭 배치, 하단 Border로 구분.
    *   **Search & Filter Toolbar**: 탭 하단에 검색창(좌측)과 필터/기간선택/CSV다운로드(우측) 배치.
    *   **Table Styling**:
        *   헤더 배경색(`grey.50`) 적용으로 본문과 구분.
        *   `NoWrap` 적용으로 깔끔한 텍스트 표시.
    *   **Pagination**: 카드 하단에 페이지네이션 컨트롤 배치.
