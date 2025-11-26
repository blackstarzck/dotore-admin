export interface MailRecipient {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sentAt: string;
  type: 'auto' | 'manual'; // 메일 유형 (자동/수동)
  status: 'success' | 'failed'; // 수신 상태 (성공/실패)
  templateName: string; // 템플릿 이름
}

export interface MailHistory {
  id: string;
  templateName: string;
  groupName: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'success' | 'partial' | 'failed';
  sentAt: string;
  sentBy: string;
  type: 'auto' | 'manual'; // 자동/수동 구분
  successfulRecipients?: MailRecipient[]; // 발송 성공한 사용자 목록
  failedRecipients?: MailRecipient[]; // 발송 실패한 사용자 목록
}

// 랜덤 수신자 생성 함수
export const generateRecipients = (
  idPrefix: string,
  count: number,
  sentAt: string,
  type: 'auto' | 'manual',
  templateName: string,
  status: 'success' | 'failed' = 'success'
): MailRecipient[] => {
  const recipients: MailRecipient[] = [];
  const firstNames = ['홍', '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전'];
  const lastNames = ['길동', '철수', '영희', '민수', '지영', '수진', '동현', '민지', '준호', '지훈', '서연', '민준', '현우', '지은', '예진', '승현', '유진', '지원', '성민', '하은'];

  const baseDate = new Date(sentAt);

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const userId = `user${String(i + 1).padStart(3, '0')}`;
    const userEmail = `${userId}@example.com`;

    // 자동 발송의 경우 각 사용자마다 다른 발송 시간 생성 (기준 시간 기준 -7일 ~ +1일 범위 내)
    let recipientSentAt: string;
    if (type === 'auto') {
      // -7일 ~ +1일 범위 내 랜덤 시간 (밀리초 단위)
      const randomDays = Math.floor(Math.random() * 9) - 7; // -7 ~ 1
      const randomHours = Math.floor(Math.random() * 24); // 0 ~ 23
      const randomMinutes = Math.floor(Math.random() * 60); // 0 ~ 59

      const recipientDate = new Date(baseDate);
      recipientDate.setDate(recipientDate.getDate() + randomDays);
      recipientDate.setHours(recipientDate.getHours() + randomHours);
      recipientDate.setMinutes(recipientDate.getMinutes() + randomMinutes);

      recipientSentAt = recipientDate.toISOString();
    } else {
      // 수동 발송의 경우 모두 동일한 시간
      recipientSentAt = sentAt;
    }

    recipients.push({
      id: `${idPrefix}-r${i + 1}`,
      userId,
      userName: `${firstName}${lastName}`,
      userEmail,
      sentAt: recipientSentAt,
      type,
      status: status,
      templateName,
    });
  }

  return recipients;
};

// 발송 이력 더미데이터
export const mockMailHistory: MailHistory[] = [
  (() => {
    const recipientCount = Math.floor(Math.random() * 25) + 5; // 5-29 사이 랜덤
    const sentCount = recipientCount - 2;
    const failedCount = 2;
    const sentAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    return {
      id: '1',
      templateName: '환영 메일',
      groupName: '학생',
      recipientCount,
      sentCount,
      failedCount,
      status: 'success' as const,
      sentAt,
      sentBy: '관리자',
      type: 'auto' as const,
      successfulRecipients: generateRecipients('1', sentCount, sentAt, 'auto', '환영 메일', 'success'),
      failedRecipients: generateRecipients('1', failedCount, sentAt, 'auto', '환영 메일', 'failed'),
    };
  })(),
  (() => {
    const recipientCount = Math.floor(Math.random() * 20) + 3; // 3-22 사이 랜덤
    const sentCount = recipientCount;
    const failedCount = 0;
    const sentAt = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    return {
      id: '2',
      templateName: '강의 안내',
      groupName: '강사',
      recipientCount,
      sentCount,
      failedCount,
      status: 'success' as const,
      sentAt,
      sentBy: '관리자',
      type: 'auto' as const,
      successfulRecipients: generateRecipients('2', sentCount, sentAt, 'auto', '강의 안내', 'success'),
      failedRecipients: [],
    };
  })(),
  (() => {
    const recipientCount = Math.floor(Math.random() * 15) + 5; // 5-19 사이 랜덤
    const sentCount = Math.floor(recipientCount * 0.6); // 약 60% 성공
    const failedCount = recipientCount - sentCount;
    const sentAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: '3',
      templateName: '이벤트 공지',
      groupName: '제휴사',
      recipientCount,
      sentCount,
      failedCount,
      status: 'partial' as const,
      sentAt,
      sentBy: '관리자',
      type: 'manual' as const,
      successfulRecipients: generateRecipients('3', sentCount, sentAt, 'manual', '이벤트 공지', 'success'),
      failedRecipients: generateRecipients('3', failedCount, sentAt, 'manual', '이벤트 공지', 'failed'),
    };
  })(),
  (() => {
    const recipientCount = Math.floor(Math.random() * 18) + 8; // 8-25 사이 랜덤
    const sentCount = 0;
    const failedCount = recipientCount;
    const sentAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: '4',
      templateName: '시스템 점검 안내',
      groupName: '학생',
      recipientCount,
      sentCount,
      failedCount,
      status: 'failed' as const,
      sentAt,
      sentBy: '관리자',
      type: 'auto' as const,
      successfulRecipients: [],
      failedRecipients: generateRecipients('4', failedCount, sentAt, 'auto', '시스템 점검 안내', 'failed'),
    };
  })(),
  (() => {
    const recipientCount = Math.floor(Math.random() * 22) + 6; // 6-27 사이 랜덤
    const sentCount = recipientCount;
    const failedCount = 0;
    const sentAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    return {
      id: '5',
      templateName: '결제 완료 안내',
      groupName: '학생',
      recipientCount,
      sentCount,
      failedCount,
      status: 'success' as const,
      sentAt,
      sentBy: '관리자',
      type: 'manual' as const,
      successfulRecipients: generateRecipients('5', sentCount, sentAt, 'manual', '결제 완료 안내', 'success'),
      failedRecipients: [],
    };
  })(),
];
