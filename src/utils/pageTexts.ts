import { MultilingualContent } from '../types/multilingual';

export interface PageTexts {
  title: MultilingualContent;
  description?: MultilingualContent;
}

export const pageTexts: Record<string, PageTexts> = {
  autoMail: {
    title: {
      ko: '자동 메일',
      en: 'Auto Mail',
      vi: 'Email tự động',
    },
    description: {
      ko: '사용자에게 자동으로 발송되는 이메일 템플릿 목록입니다.',
      en: 'List of email templates that are automatically sent to users.',
      vi: 'Danh sách các mẫu email được gửi tự động cho người dùng.',
    },
  },
  manualMail: {
    title: {
      ko: '수동 메일',
      en: 'Manual Mail',
      vi: 'Email thủ công',
    },
    description: {
      ko: '관리자가 수동으로 발송하는 이메일 템플릿 목록입니다.',
      en: 'List of email templates that administrators send manually.',
      vi: 'Danh sách các mẫu email mà quản trị viên gửi thủ công.',
    },
  },
  inquiryList: {
    title: {
      ko: '문의 목록',
      en: 'Inquiry List',
      vi: 'Danh sách yêu cầu',
    },
  },
  inquiryAnalysis: {
    title: {
      ko: '문의 분석',
      en: 'Inquiry Analysis',
      vi: 'Phân tích yêu cầu',
    },
  },
  mailGroup: {
    title: {
      ko: '발송 그룹',
      en: 'Send Group',
      vi: 'Nhóm gửi',
    },
    description: {
      ko: '메일 발송 그룹을 생성, 수정, 삭제할 수 있습니다.',
      en: 'You can create, modify, and delete mail send groups.',
      vi: 'Bạn có thể tạo, sửa đổi và xóa nhóm gửi email.',
    },
  },
  mailHistory: {
    title: {
      ko: '발송 이력',
      en: 'Send History',
      vi: 'Lịch sử gửi',
    },
  },
  mailTemplate: {
    title: {
      ko: '템플릿 편집',
      en: 'Template Edit',
      vi: 'Chỉnh sửa mẫu',
    },
  },
  login: {
    title: {
      ko: '로그인',
      en: 'Login',
      vi: 'Đăng nhập',
    },
  },
};

// 공통 버튼 및 UI 텍스트
export const commonTexts: Record<string, MultilingualContent> = {
  newTemplateRegister: {
    ko: '새 템플릿 등록',
    en: 'New Template',
    vi: 'Mẫu mới',
  },
  newTemplateCreate: {
    ko: '새 템플릿 작성',
    en: 'Create New Template',
    vi: 'Tạo mẫu mới',
  },
  templateEdit: {
    ko: '템플릿 수정',
    en: 'Edit Template',
    vi: 'Chỉnh sửa mẫu',
  },
  save: {
    ko: '저장',
    en: 'Save',
    vi: 'Lưu',
  },
  edit: {
    ko: '수정',
    en: 'Edit',
    vi: 'Chỉnh sửa',
  },
  cancel: {
    ko: '취소',
    en: 'Cancel',
    vi: 'Hủy',
  },
  send: {
    ko: '발송',
    en: 'Send',
    vi: 'Gửi',
  },
  templateEditTooltip: {
    ko: '템플릿 수정',
    en: 'Edit Template',
    vi: 'Chỉnh sửa mẫu',
  },
  sendToMe: {
    ko: '나에게 보내기',
    en: 'Send to Me',
    vi: 'Gửi cho tôi',
  },
  previewTemplate: {
    ko: '템플릿을 미리 볼 수 있습니다.',
    en: 'You can preview the template.',
    vi: 'Bạn có thể xem trước mẫu.',
  },
  dateTimeInfo: {
    ko: '날짜와 시간은 사용자의 국적 기준입니다.',
    en: 'Date and time are based on the user\'s nationality.',
    vi: 'Ngày và giờ dựa trên quốc tịch của người dùng.',
  },
  copyEmail: {
    ko: '이메일 복사',
    en: 'Copy Email',
    vi: 'Sao chép email',
  },
  csvDownload: {
    ko: 'CSV 다운로드',
    en: 'Download CSV',
    vi: 'Tải xuống CSV',
  },
  delete: {
    ko: '삭제',
    en: 'Delete',
    vi: 'Xóa',
  },
  languageSelect: {
    ko: '언어 선택',
    en: 'Select Language',
    vi: 'Chọn ngôn ngữ',
  },
  attachment: {
    ko: '첨부파일',
    en: 'Attachment',
    vi: 'Tệp đính kèm',
  },
  noSavedTemplate: {
    ko: '저장된 템플릿이 없습니다. 템플릿을 편집하여 저장해주세요.',
    en: 'No saved template. Please edit and save the template.',
    vi: 'Không có mẫu đã lưu. Vui lòng chỉnh sửa và lưu mẫu.',
  },
  loadingTemplate: {
    ko: '템플릿을 불러오는 중...',
    en: 'Loading template...',
    vi: 'Đang tải mẫu...',
  },
  deleteTemplateConfirm: {
    ko: '정말로 {name} 템플릿을 삭제하시겠습니까?',
    en: 'Are you sure you want to delete the {name} template?',
    vi: 'Bạn có chắc chắn muốn xóa mẫu {name} không?',
  },
  templateDeleted: {
    ko: '템플릿이 삭제되었습니다.',
    en: 'Template has been deleted.',
    vi: 'Mẫu đã được xóa.',
  },
  sendConfirm: {
    ko: '발송 확인',
    en: 'Send Confirmation',
    vi: 'Xác nhận gửi',
  },
  sendConfirmMessage: {
    ko: '총 {count}명에게 발송하시겠습니까?',
    en: 'Do you want to send to {count} recipients?',
    vi: 'Bạn có muốn gửi cho {count} người nhận không?',
  },
  noRecipientsSelected: {
    ko: '발송 대상이 선택되지 않았습니다.',
    en: 'No recipients selected.',
    vi: 'Chưa chọn người nhận.',
  },
  sendToMeDescription: {
    ko: '발송하기 전 나에게 미리 발송해보세요.',
    en: 'Send a test email to yourself before sending.',
    vi: 'Gửi email thử nghiệm cho chính bạn trước khi gửi.',
  },
  emailAddress: {
    ko: '이메일 주소',
    en: 'Email Address',
    vi: 'Địa chỉ email',
  },
  testEmailSent: {
    ko: '테스트 메일이 {email}로 발송되었습니다.',
    en: 'Test email has been sent to {email}.',
    vi: 'Email thử nghiệm đã được gửi đến {email}.',
  },
  addGroup: {
    ko: '그룹 추가',
    en: 'Add Group',
    vi: 'Thêm nhóm',
  },
  editGroup: {
    ko: '그룹 수정',
    en: 'Edit Group',
    vi: 'Chỉnh sửa nhóm',
  },
  deleteGroup: {
    ko: '그룹 삭제',
    en: 'Delete Group',
    vi: 'Xóa nhóm',
  },
  groupName: {
    ko: '그룹 이름',
    en: 'Group Name',
    vi: 'Tên nhóm',
  },
  description: {
    ko: '설명',
    en: 'Description',
    vi: 'Mô tả',
  },
  descriptionOptional: {
    ko: '설명 (선택사항)',
    en: 'Description (Optional)',
    vi: 'Mô tả (Tùy chọn)',
  },
  members: {
    ko: '인원',
    en: 'Members',
    vi: 'Thành viên',
  },
  actions: {
    ko: '작업',
    en: 'Actions',
    vi: 'Thao tác',
  },
  noGroupsRegistered: {
    ko: '등록된 그룹이 없습니다.',
    en: 'No groups registered.',
    vi: 'Không có nhóm nào được đăng ký.',
  },
  memberCount: {
    ko: '명',
    en: 'members',
    vi: 'thành viên',
  },
  deleteGroupConfirm: {
    ko: '정말로 {name} 그룹을 삭제하시겠습니까?',
    en: 'Are you sure you want to delete the {name} group?',
    vi: 'Bạn có chắc chắn muốn xóa nhóm {name} không?',
  },
  groupUpdated: {
    ko: '발송그룹이 수정되었습니다.',
    en: 'Send group has been updated.',
    vi: 'Nhóm gửi đã được cập nhật.',
  },
  groupAdded: {
    ko: '발송그룹이 추가되었습니다.',
    en: 'Send group has been added.',
    vi: 'Nhóm gửi đã được thêm.',
  },
  groupDeleted: {
    ko: '발송그룹이 삭제되었습니다.',
    en: 'Send group has been deleted.',
    vi: 'Nhóm gửi đã được xóa.',
  },
  groupNameRequired: {
    ko: '그룹 이름을 입력해주세요.',
    en: 'Please enter a group name.',
    vi: 'Vui lòng nhập tên nhóm.',
  },
  groupNameMinLength: {
    ko: '그룹 이름은 최소 2자 이상이어야 합니다.',
    en: 'Group name must be at least 2 characters.',
    vi: 'Tên nhóm phải có ít nhất 2 ký tự.',
  },
  groupNameDuplicate: {
    ko: '이미 존재하는 그룹 이름입니다.',
    en: 'Group name already exists.',
    vi: 'Tên nhóm đã tồn tại.',
  },
  queryBuilder: {
    ko: '그룹 조건 설정',
    en: 'Set Group Conditions',
    vi: 'Thiết lập điều kiện nhóm',
  },
  addRule: {
    ko: '조건 추가',
    en: 'Add Condition',
    vi: 'Thêm điều kiện',
  },
  addQueryGroup: {
    ko: '그룹 추가',
    en: 'Add Group',
    vi: 'Thêm nhóm',
  },
  removeRule: {
    ko: '조건 제거',
    en: 'Remove Condition',
    vi: 'Xóa điều kiện',
  },
  removeGroup: {
    ko: '그룹 제거',
    en: 'Remove Group',
    vi: 'Xóa nhóm',
  },
  field: {
    ko: '필드',
    en: 'Field',
    vi: 'Trường',
  },
  operator: {
    ko: '연산자',
    en: 'Operator',
    vi: 'Toán tử',
  },
  value: {
    ko: '값',
    en: 'Value',
    vi: 'Giá trị',
  },
  combinator: {
    ko: '조합',
    en: 'Combinator',
    vi: 'Kết hợp',
  },
  and: {
    ko: '그리고',
    en: 'And',
    vi: 'Và',
  },
  or: {
    ko: '또는',
    en: 'Or',
    vi: 'Hoặc',
  },
  userId: {
    ko: '사용자 ID',
    en: 'User ID',
    vi: 'ID người dùng',
  },
  userName: {
    ko: '사용자명',
    en: 'User Name',
    vi: 'Tên người dùng',
  },
  userEmail: {
    ko: '이메일',
    en: 'Email',
    vi: 'Email',
  },
  userCountry: {
    ko: '국적',
    en: 'Country',
    vi: 'Quốc gia',
  },
  userType: {
    ko: '작성자 유형',
    en: 'User Type',
    vi: 'Loại người dùng',
  },
  userGender: {
    ko: '성별',
    en: 'Gender',
    vi: 'Giới tính',
  },
  userAge: {
    ko: '나이',
    en: 'Age',
    vi: 'Tuổi',
  },
  student: {
    ko: '학생',
    en: 'Student',
    vi: 'Học sinh',
  },
  instructor: {
    ko: '강사',
    en: 'Instructor',
    vi: 'Giảng viên',
  },
  partner: {
    ko: '제휴사',
    en: 'Partner',
    vi: 'Đối tác',
  },
  male: {
    ko: '남성',
    en: 'Male',
    vi: 'Nam',
  },
  female: {
    ko: '여성',
    en: 'Female',
    vi: 'Nữ',
  },
  other: {
    ko: '기타',
    en: 'Other',
    vi: 'Khác',
  },
  equals: {
    ko: '같음',
    en: 'Equals',
    vi: 'Bằng',
  },
  notEquals: {
    ko: '같지 않음',
    en: 'Not Equals',
    vi: 'Không bằng',
  },
  contains: {
    ko: '포함',
    en: 'Contains',
    vi: 'Chứa',
  },
  notContains: {
    ko: '포함하지 않음',
    en: 'Not Contains',
    vi: 'Không chứa',
  },
  in: {
    ko: '포함됨',
    en: 'In',
    vi: 'Trong',
  },
  notIn: {
    ko: '포함되지 않음',
    en: 'Not In',
    vi: 'Không trong',
  },
  greaterThan: {
    ko: '보다 큼',
    en: 'Greater Than',
    vi: 'Lớn hơn',
  },
  greaterThanOrEqual: {
    ko: '보다 크거나 같음',
    en: 'Greater Than Or Equal',
    vi: 'Lớn hơn hoặc bằng',
  },
  lessThan: {
    ko: '보다 작음',
    en: 'Less Than',
    vi: 'Nhỏ hơn',
  },
  lessThanOrEqual: {
    ko: '보다 작거나 같음',
    en: 'Less Than Or Equal',
    vi: 'Nhỏ hơn hoặc bằng',
  },
  between: {
    ko: '사이',
    en: 'Between',
    vi: 'Giữa',
  },
  notBetween: {
    ko: '사이 아님',
    en: 'Not Between',
    vi: 'Không giữa',
  },
  beginsWith: {
    ko: '시작함',
    en: 'Begins With',
    vi: 'Bắt đầu bằng',
  },
  doesNotBeginWith: {
    ko: '시작하지 않음',
    en: 'Does Not Begin With',
    vi: 'Không bắt đầu bằng',
  },
  endsWith: {
    ko: '끝남',
    en: 'Ends With',
    vi: 'Kết thúc bằng',
  },
  doesNotEndWith: {
    ko: '끝나지 않음',
    en: 'Does Not End With',
    vi: 'Không kết thúc bằng',
  },
  isNull: {
    ko: '비어있음',
    en: 'Is Null',
    vi: 'Rỗng',
  },
  isNotNull: {
    ko: '비어있지 않음',
    en: 'Is Not Null',
    vi: 'Không rỗng',
  },
  convertToSQL: {
    ko: 'SQL로 변환',
    en: 'Convert to SQL',
    vi: 'Chuyển đổi sang SQL',
  },
  convertToJSON: {
    ko: 'JSON으로 변환',
    en: 'Convert to JSON',
    vi: 'Chuyển đổi sang JSON',
  },
  convertToNaturalLanguage: {
    ko: '자연어로 변환',
    en: 'Convert to Natural Language',
    vi: 'Chuyển đổi sang ngôn ngữ tự nhiên',
  },
  convertedQuery: {
    ko: '변환된 쿼리',
    en: 'Converted Query',
    vi: 'Truy vấn đã chuyển đổi',
  },
  copyToClipboard: {
    ko: '클립보드에 복사',
    en: 'Copy to Clipboard',
    vi: 'Sao chép vào clipboard',
  },
  noConditionsToConvert: {
    ko: '변환할 조건이 없습니다.',
    en: 'No conditions to convert.',
    vi: 'Không có điều kiện để chuyển đổi.',
  },
  convertError: {
    ko: '변환 중 오류가 발생했습니다.',
    en: 'An error occurred during conversion.',
    vi: 'Đã xảy ra lỗi khi chuyển đổi.',
  },
  copiedToClipboard: {
    ko: '클립보드에 복사되었습니다.',
    en: 'Copied to clipboard.',
    vi: 'Đã sao chép vào clipboard.',
  },
  search: {
    ko: '검색',
    en: 'Search',
    vi: 'Tìm kiếm',
  },
  searchPlaceholder: {
    ko: '검색...',
    en: 'Search...',
    vi: 'Tìm kiếm...',
  },
  detail: {
    ko: '상세',
    en: 'Detail',
    vi: 'Chi tiết',
  },
  detailSearch: {
    ko: '상세 검색',
    en: 'Detail Search',
    vi: 'Tìm kiếm chi tiết',
  },
  all: {
    ko: '전체',
    en: 'All',
    vi: 'Tất cả',
  },
  templateName: {
    ko: '템플릿 이름',
    en: 'Template Name',
    vi: 'Tên mẫu',
  },
  sentBy: {
    ko: '발송자',
    en: 'Sent By',
    vi: 'Người gửi',
  },
  type: {
    ko: '유형',
    en: 'Type',
    vi: 'Loại',
  },
  auto: {
    ko: '자동',
    en: 'Auto',
    vi: 'Tự động',
  },
  manual: {
    ko: '수동',
    en: 'Manual',
    vi: 'Thủ công',
  },
  status: {
    ko: '상태',
    en: 'Status',
    vi: 'Trạng thái',
  },
  success: {
    ko: '성공',
    en: 'Success',
    vi: 'Thành công',
  },
  partial: {
    ko: '부분 성공',
    en: 'Partial',
    vi: 'Một phần',
  },
  failed: {
    ko: '실패',
    en: 'Failed',
    vi: 'Thất bại',
  },
  period: {
    ko: '기간',
    en: 'Period',
    vi: 'Khoảng thời gian',
  },
  today: {
    ko: '오늘',
    en: 'Today',
    vi: 'Hôm nay',
  },
  week: {
    ko: '최근 7일',
    en: 'Last 7 Days',
    vi: '7 ngày qua',
  },
  month: {
    ko: '최근 30일',
    en: 'Last 30 Days',
    vi: '30 ngày qua',
  },
  startDate: {
    ko: '시작일',
    en: 'Start Date',
    vi: 'Ngày bắt đầu',
  },
  endDate: {
    ko: '종료일',
    en: 'End Date',
    vi: 'Ngày kết thúc',
  },
  resetFilter: {
    ko: '필터 초기화',
    en: 'Reset Filter',
    vi: 'Đặt lại bộ lọc',
  },
  user_id: {
    ko: '아이디',
    en: 'ID',
    vi: 'ID',
  },
  user_name: {
    ko: '이름',
    en: 'Name',
    vi: 'Tên',
  },
  category: {
    ko: '카테고리',
    en: 'Category',
    vi: 'Danh mục',
  },
  country: {
    ko: '국적',
    en: 'Country',
    vi: 'Quốc gia',
  },
  user_nickname: {
    ko: '닉네임',
    en: 'Nickname',
    vi: 'Biệt danh',
  },
  answerer: {
    ko: '답변자',
    en: 'Answerer',
    vi: 'Người trả lời',
  },
  content: {
    ko: '문의 내용',
    en: 'Inquiry Content',
    vi: 'Nội dung yêu cầu',
  },
};

export const getPageText = (pageKey: string, language: 'ko' | 'en' | 'vi'): { title: string; description?: string } => {
  const pageText = pageTexts[pageKey];
  if (!pageText) {
    return { title: pageKey };
  }

  return {
    title: pageText.title[language],
    description: pageText.description?.[language],
  };
};

export const getCommonText = (textKey: string, language: 'ko' | 'en' | 'vi'): string => {
  const text = commonTexts[textKey];
  if (!text) {
    return textKey;
  }
  return text[language];
};
