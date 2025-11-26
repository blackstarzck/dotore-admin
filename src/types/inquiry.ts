export enum InquiryCategory {
  Learning = 'Learning',
  Payment = 'Payment',
  Instructor = 'Instructor',
  Content = 'Content',
  AI_Chatbot = 'AI_Chatbot',
  Test = 'Test',
  Dashboard = 'Dashboard',
  InstructorSupport = 'InstructorSupport',
  PackageEvent = 'PackageEvent',
}

export enum UserType {
  Student = 'Student',
  Instructor = 'Instructor',
  Partner = 'Partner',
}

export enum UserGender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum InquiryStatus {
  Pending = 'Pending',
  Answered = 'Answered',
}

export interface Attachment {
  filename: string;
  url?: string;
  size?: number;
}

export interface Inquiry {
  id: string;
  category: InquiryCategory;
  user_type: UserType;
  user_id: string;
  user_name: string;
  user_nickname?: string;
  user_email: string;
  user_gender: UserGender;
  user_country: string;
  user_age: number;
  title: string;
  content: string;
  has_attachment: boolean;
  attachment_filename?: string; // 하위 호환성을 위해 유지
  attachments?: Attachment[]; // 여러 첨부파일 지원
  created_at: string;
  status: InquiryStatus;
  answer_content?: string;
  answerer_id?: string;
  answered_at?: string;
}
