export interface MailTemplate {
  id: number | string; // 수동 메일은 number, 자동 메일은 string (하위 호환성)
  name: string; // 관리용 템플릿 이름
  title?: string; // 실제 이메일 제목
  description?: string;
}

export interface MailGroup {
  id: string;
  name: string;
  templates: MailTemplate[];
}

// 자동 메일 더미데이터
export const autoMailGroups: MailGroup[] = [
  {
    id: 'member',
    name: '회원',
    templates: [
      { id: 1, name: '가입 환영', title: '도토리에 오신 것을 환영합니다!', description: '신규 회원 가입 시 자동으로 발송되는 환영 메일' },
      { id: 2, name: '이메일 인증', title: '[도토리] 이메일 인증 코드', description: '이메일 인증을 위한 인증 코드 발송' },
      { id: 3, name: '아이디 확인', title: '[도토리] 아이디 확인 안내', description: '아이디 찾기 요청 시 아이디 정보 발송' },
      { id: 4, name: '비밀번호 재설정', title: '[도토리] 비밀번호 재설정 안내', description: '비밀번호 재설정 링크 발송' },
      { id: 5, name: '계정 잠금', title: '[도토리] 계정 잠금 안내', description: '로그인 실패로 인한 계정 잠금 안내' },
    ],
  },
  {
    id: 'order',
    name: '주문',
    templates: [
      { id: 6, name: '주문 확인', title: '[도토리] 주문이 완료되었습니다', description: '주문 완료 시 주문 내역 발송' },
      { id: 7, name: '결제 확인', title: '[도토리] 결제가 완료되었습니다', description: '결제 완료 시 결제 내역 발송' },
      { id: 8, name: '배송 알림', title: '[도토리] 상품이 배송되었습니다', description: '상품 배송 시작 시 배송 정보 발송' },
      { id: 9, name: '배송 완료', title: '[도토리] 배송이 완료되었습니다', description: '배송 완료 시 완료 알림 발송' },
      { id: 10, name: '주문 취소', title: '[도토리] 주문이 취소되었습니다', description: '주문 취소 시 취소 내역 발송' },
    ],
  },
  {
    id: 'payment',
    name: '결제',
    templates: [
      { id: 11, name: '결제 성공', title: '[도토리] 결제가 성공적으로 완료되었습니다', description: '결제 성공 시 결제 정보 발송' },
      { id: 12, name: '결제 실패', title: '[도토리] 결제 실패 안내', description: '결제 실패 시 실패 사유 발송' },
      { id: 13, name: '환불 완료', title: '[도토리] 환불이 완료되었습니다', description: '환불 완료 시 환불 내역 발송' },
    ],
  },
  {
    id: 'notification',
    name: '알림',
    templates: [
      { id: 14, name: '시스템 공지', title: '[도토리] 시스템 공지사항', description: '시스템 점검 및 공지사항 발송' },
      { id: 15, name: '이벤트 알림', title: '[도토리] 특별 이벤트 안내', description: '이벤트 및 프로모션 알림 발송' },
      { id: 16, name: '문의 답변', title: '[도토리] 문의하신 내용에 대한 답변입니다', description: '문의 답변 완료 시 알림 발송' },
    ],
  },
];

// 수동 메일 더미데이터
export const manualMailGroups: MailGroup[] = [
  {
    id: 'marketing',
    name: '마케팅',
    templates: [
      { id: 1, name: '뉴스레터', title: '[도토리] 월간 뉴스레터 - {{month}}월호', description: '정기 뉴스레터 발송' },
      { id: 2, name: '프로모션', title: '🎉 특별 할인 프로모션 안내', description: '할인 및 프로모션 안내' },
      { id: 3, name: '신제품 출시', title: '새로운 제품이 출시되었습니다!', description: '신제품 출시 안내' },
      { id: 4, name: '계절 인사', title: '{{season}} 인사드립니다', description: '명절 및 계절 인사 메일' },
    ],
  },
  {
    id: 'customer-service',
    name: '고객 서비스',
    templates: [
      { id: 5, name: '맞춤 문의', title: '문의하신 내용에 대한 답변입니다', description: '고객 맞춤 문의 응답' },
      { id: 6, name: '불만 처리', title: '불편을 드려 죄송합니다 - 처리 안내', description: '고객 불만 처리 안내' },
      { id: 7, name: '피드백 요청', title: '서비스 개선을 위한 피드백 요청', description: '서비스 피드백 요청' },
      { id: 8, name: '만족도 조사', title: '고객 만족도 조사 참여 요청', description: '고객 만족도 조사 요청' },
    ],
  },
  {
    id: 'education',
    name: '교육',
    templates: [
      { id: 9, name: '강의 알림', title: '[{{courseName}}] 강의 시작 안내', description: '강의 시작 및 마감 알림' },
      { id: 10, name: '과제 안내', title: '[{{courseName}}] 과제 제출 안내', description: '과제 제출 안내' },
      { id: 11, name: '수료증 발급', title: '축하합니다! 수료증이 발급되었습니다', description: '과정 수료 시 수료증 발급 안내' },
    ],
  },
  {
    id: 'admin',
    name: '관리자',
    templates: [
      { id: 12, name: '관리자 공지', title: '[관리자 공지] {{subject}}', description: '관리자 대상 공지사항' },
      { id: 13, name: '보고서 요약', title: '[{{period}}] 보고서 요약', description: '주간/월간 보고서 발송' },
      { id: 14, name: '시스템 경고', title: '[긴급] 시스템 이상 감지 알림', description: '시스템 이상 감지 시 경고 발송' },
    ],
  },
  {
    id: 'etc',
    name: '기타',
    templates: [],
  },
];
