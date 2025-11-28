import { RuleGroupType } from 'react-querybuilder';
import { MultilingualContent } from '../types/multilingual';

export interface SendGroup {
  id: string;
  name: string | MultilingualContent;
  description?: string | MultilingualContent;
  memberCount: number;
  query?: RuleGroupType;
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'instructor',
    name: '강사',
    description: '강사 대상 발송 그룹',
    memberCount: 85,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner',
    name: '제휴사',
    description: '제휴사 대상 발송 그룹',
    memberCount: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
