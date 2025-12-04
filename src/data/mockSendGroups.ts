import { RuleGroupType } from 'react-querybuilder';
import { MultilingualContent } from '../types/multilingual';

export interface SendGroup {
  id: string;
  name: string | MultilingualContent;
  description?: string | MultilingualContent;
  memberCount: number;
  query?: RuleGroupType;
  memberCountCheckedAt?: string; // 조회하기를 눌러 memberCount를 확인한 시간
  createdAt: string;
  updatedAt: string;
}

// 발송그룹 더미데이터
export const mockSendGroups: SendGroup[] = [
  {
    id: 'student',
    name: '학생',
    description: '학생 대상 발송 그룹',
    memberCount: 1250,
    // 간편 설정: 한국만, 연령 18-30, 성별 전체, 가입 유형 Student, 이메일/구글 가입, 최근 1년 가입, 구독 중, 활동 중
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'userCountry',
          operator: '=',
          value: 'KR',
        },
        {
          field: 'userAge',
          operator: 'between',
          value: [18, 30],
        },
        {
          field: 'userType',
          operator: '=',
          value: 'Student',
        },
        {
          field: 'signupMethod',
          operator: 'in',
          value: ['email', 'google'],
        },
        {
          field: 'signupDate',
          operator: '>=',
          value: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 최근 1년
        },
        {
          field: 'subscriptionStatus',
          operator: '=',
          value: 'subscribed',
        },
        {
          field: 'activityStatus',
          operator: '=',
          value: 'active',
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'instructor',
    name: '강사',
    description: '강사 대상 발송 그룹',
    memberCount: 85,
    // 간편 설정: 한국, 미국, 연령 25-50, 성별 전체, 가입 유형 Instructor, 구글/페이스북 가입, 최근 6개월 가입, 구독 중, 활동 중
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'userCountry',
          operator: 'in',
          value: 'KR,US',
        },
        {
          field: 'userAge',
          operator: 'between',
          value: [25, 50],
        },
        {
          field: 'userType',
          operator: '=',
          value: 'Instructor',
        },
        {
          field: 'signupMethod',
          operator: 'in',
          value: ['google', 'facebook'],
        },
        {
          field: 'signupDate',
          operator: '>=',
          value: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 최근 6개월
        },
        {
          field: 'subscriptionStatus',
          operator: '=',
          value: 'subscribed',
        },
        {
          field: 'activityStatus',
          operator: '=',
          value: 'active',
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner',
    name: '제휴사',
    description: '제휴사 대상 발송 그룹',
    memberCount: 32,
    // 간편 설정: 미국, 베트남, 연령 30-60, 성별 전체, 가입 유형 Partner, 전체 가입 방식, 2023년 이후 가입, 구독 중, 활동 중
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'userCountry',
          operator: 'in',
          value: 'US,VN',
        },
        {
          field: 'userAge',
          operator: 'between',
          value: [30, 60],
        },
        {
          field: 'userType',
          operator: '=',
          value: 'Partner',
        },
        {
          field: 'signupDate',
          operator: '>=',
          value: '2023-01-01', // 2023년 이후
        },
        {
          field: 'subscriptionStatus',
          operator: '=',
          value: 'subscribed',
        },
        {
          field: 'activityStatus',
          operator: '=',
          value: 'active',
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
