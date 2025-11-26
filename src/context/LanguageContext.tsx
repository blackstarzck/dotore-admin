import React, { createContext, useState, useEffect, useContext } from 'react';

export type Language = 'ko' | 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
    'admin.title': '관리자 문의 관리 시스템',
    'menu.inquiry': '문의 관리',
    'menu.inquiry.list': '문의 목록',
    'menu.inquiry.analysis': '문의 분석',
    'menu.mail': '메일 관리',
    'menu.mail.auto': '자동 메일',
    'menu.mail.manual': '수동 메일',
    'menu.mail.group': '발송그룹 관리',
    'menu.mail.history': '발송 이력',
    'menu.logout': '로그아웃',
    'tooltip.explore': 'Explore',
    'tooltip.lightMode': '라이트 모드',
    'tooltip.darkMode': '다크 모드',
    'tooltip.fullscreen': '전체화면',
    'tooltip.notifications': '알림',
    'breadcrumb.inquiry': '문의 관리',
    'breadcrumb.inquiry.list': '문의 목록',
    'breadcrumb.inquiry.analysis': '문의 분석',
    'breadcrumb.mail': '메일 관리',
    'breadcrumb.mail.auto': '자동 메일',
    'breadcrumb.mail.manual': '수동 메일',
    'breadcrumb.mail.group': '발송그룹 관리',
    'breadcrumb.mail.history': '발송 이력',
    'mailHistory.title': '발송 이력',
    'mailHistory.subtitle': '메일 발송 이력을 확인할 수 있습니다.',
    'mailHistory.templateName': '템플릿 이름',
    'mailHistory.groupName': '그룹 이름',
    'mailHistory.recipientCount': '수신자 수',
    'mailHistory.sentCount': '발송 성공',
    'mailHistory.failedCount': '발송 실패',
    'mailHistory.status': '상태',
    'mailHistory.status.success': '성공',
    'mailHistory.status.partial': '부분 성공',
    'mailHistory.status.failed': '실패',
    'mailHistory.sentDate': '발송일',
    'mailHistory.sentAt': '발송 시간',
    'mailHistory.sentBy': '발송자',
    'mailHistory.type': '유형',
    'mailHistory.type.auto': '자동',
    'mailHistory.type.manual': '수동',
    'mailHistory.recipientStatus': '수신 상태',
    'mailHistory.recipientStatus.success': '성공',
    'mailHistory.recipientStatus.failed': '실패',
    'mailHistory.noHistory': '발송 이력이 없습니다.',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
  },
  en: {
    'admin.title': 'Admin Inquiry Management System',
    'menu.inquiry': 'Inquiry Management',
    'menu.inquiry.list': 'Inquiry List',
    'menu.inquiry.analysis': 'Inquiry Analysis',
    'menu.mail': 'Mail Management',
    'menu.mail.auto': 'Auto Mail',
    'menu.mail.manual': 'Manual Mail',
    'menu.mail.group': 'Mail Group Management',
    'menu.mail.history': 'Mail History',
    'menu.logout': 'Logout',
    'tooltip.explore': 'Explore',
    'tooltip.lightMode': 'Light Mode',
    'tooltip.darkMode': 'Dark Mode',
    'tooltip.fullscreen': 'Fullscreen',
    'tooltip.notifications': 'Notifications',
    'breadcrumb.inquiry': 'Inquiry Management',
    'breadcrumb.inquiry.list': 'Inquiry List',
    'breadcrumb.inquiry.analysis': 'Inquiry Analysis',
    'breadcrumb.mail': 'Mail Management',
    'breadcrumb.mail.auto': 'Auto Mail',
    'breadcrumb.mail.manual': 'Manual Mail',
    'breadcrumb.mail.group': 'Mail Group Management',
    'breadcrumb.mail.history': 'Mail History',
    'mailHistory.title': 'Mail History',
    'mailHistory.subtitle': 'View mail sending history.',
    'mailHistory.templateName': 'Template Name',
    'mailHistory.groupName': 'Group Name',
    'mailHistory.recipientCount': 'Recipients',
    'mailHistory.sentCount': 'Sent',
    'mailHistory.failedCount': 'Failed',
    'mailHistory.status': 'Status',
    'mailHistory.status.success': 'Success',
    'mailHistory.status.partial': 'Partial',
    'mailHistory.status.failed': 'Failed',
    'mailHistory.sentDate': 'Sent Date',
    'mailHistory.sentAt': 'Sent At',
    'mailHistory.sentBy': 'Sent By',
    'mailHistory.type': 'Type',
    'mailHistory.type.auto': 'Auto',
    'mailHistory.type.manual': 'Manual',
    'mailHistory.recipientStatus': 'Recipient Status',
    'mailHistory.recipientStatus.success': 'Success',
    'mailHistory.recipientStatus.failed': 'Failed',
    'mailHistory.noHistory': 'No mail history.',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
  },
  vi: {
    'admin.title': 'Hệ thống Quản lý Yêu cầu Quản trị',
    'menu.inquiry': 'Quản lý Yêu cầu',
    'menu.inquiry.list': 'Danh sách Yêu cầu',
    'menu.inquiry.analysis': 'Phân tích Yêu cầu',
    'menu.mail': 'Quản lý Email',
    'menu.mail.auto': 'Email Tự động',
    'menu.mail.manual': 'Email Thủ công',
    'menu.mail.group': 'Quản lý Nhóm Gửi',
    'menu.mail.history': 'Lịch sử Gửi',
    'menu.logout': 'Đăng xuất',
    'tooltip.explore': 'Khám phá',
    'tooltip.lightMode': 'Chế độ Sáng',
    'tooltip.darkMode': 'Chế độ Tối',
    'tooltip.fullscreen': 'Toàn màn hình',
    'tooltip.notifications': 'Thông báo',
    'breadcrumb.inquiry': 'Quản lý Yêu cầu',
    'breadcrumb.inquiry.list': 'Danh sách Yêu cầu',
    'breadcrumb.inquiry.analysis': 'Phân tích Yêu cầu',
    'breadcrumb.mail': 'Quản lý Email',
    'breadcrumb.mail.auto': 'Email Tự động',
    'breadcrumb.mail.manual': 'Email Thủ công',
    'breadcrumb.mail.group': 'Quản lý Nhóm Gửi',
    'breadcrumb.mail.history': 'Lịch sử Gửi',
    'mailHistory.title': 'Lịch sử Gửi',
    'mailHistory.subtitle': 'Xem lịch sử gửi email.',
    'mailHistory.templateName': 'Tên Mẫu',
    'mailHistory.groupName': 'Tên Nhóm',
    'mailHistory.recipientCount': 'Người nhận',
    'mailHistory.sentCount': 'Đã gửi',
    'mailHistory.failedCount': 'Thất bại',
    'mailHistory.status': 'Trạng thái',
    'mailHistory.status.success': 'Thành công',
    'mailHistory.status.partial': 'Một phần',
    'mailHistory.status.failed': 'Thất bại',
    'mailHistory.sentDate': 'Ngày gửi',
    'mailHistory.sentAt': 'Gửi lúc',
    'mailHistory.sentBy': 'Người gửi',
    'mailHistory.type': 'Loại',
    'mailHistory.type.auto': 'Tự động',
    'mailHistory.type.manual': 'Thủ công',
    'mailHistory.recipientStatus': 'Trạng thái nhận',
    'mailHistory.recipientStatus.success': 'Thành công',
    'mailHistory.recipientStatus.failed': 'Thất bại',
    'mailHistory.noHistory': 'Không có lịch sử gửi.',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ko';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
