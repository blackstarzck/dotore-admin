import { MultilingualContent } from '../types/multilingual';

export interface MailTemplate {
  id: number | string; // 수동 메일은 number, 자동 메일은 string (하위 호환성)
  name: MultilingualContent; // 관리용 템플릿 이름
  title?: MultilingualContent; // 실제 이메일 제목
  description?: MultilingualContent;
}

export interface MailGroup {
  id: string;
  name: MultilingualContent;
  templates: MailTemplate[];
}

// 자동 메일 더미데이터
export const autoMailGroups: MailGroup[] = [
  {
    id: 'member',
    name: {
      ko: '회원',
      en: 'Member',
      vi: 'Thành viên',
    },
    templates: [
      {
        id: 1,
        name: { ko: '가입 환영', en: 'Welcome', vi: 'Chào mừng' },
        title: { ko: '도토리에 오신 것을 환영합니다!', en: 'Welcome to Dotore!', vi: 'Chào mừng đến với Dotore!' },
        description: { ko: '신규 회원 가입 시 자동으로 발송되는 환영 메일', en: 'Welcome email automatically sent when a new member joins', vi: 'Email chào mừng được gửi tự động khi thành viên mới tham gia' }
      },
      {
        id: 2,
        name: { ko: '이메일 인증', en: 'Email Verification', vi: 'Xác thực email' },
        title: { ko: '[도토리] 이메일 인증 코드', en: '[Dotore] Email Verification Code', vi: '[Dotore] Mã xác thực email' },
        description: { ko: '이메일 인증을 위한 인증 코드 발송', en: 'Send verification code for email verification', vi: 'Gửi mã xác thực để xác thực email' }
      },
      {
        id: 3,
        name: { ko: '아이디 확인', en: 'ID Confirmation', vi: 'Xác nhận ID' },
        title: { ko: '[도토리] 아이디 확인 안내', en: '[Dotore] ID Confirmation Guide', vi: '[Dotore] Hướng dẫn xác nhận ID' },
        description: { ko: '아이디 찾기 요청 시 아이디 정보 발송', en: 'Send ID information when ID recovery is requested', vi: 'Gửi thông tin ID khi có yêu cầu tìm ID' }
      },
      {
        id: 4,
        name: { ko: '비밀번호 재설정', en: 'Password Reset', vi: 'Đặt lại mật khẩu' },
        title: { ko: '[도토리] 비밀번호 재설정 안내', en: '[Dotore] Password Reset Guide', vi: '[Dotore] Hướng dẫn đặt lại mật khẩu' },
        description: { ko: '비밀번호 재설정 링크 발송', en: 'Send password reset link', vi: 'Gửi liên kết đặt lại mật khẩu' }
      },
      {
        id: 5,
        name: { ko: '계정 잠금', en: 'Account Locked', vi: 'Tài khoản bị khóa' },
        title: { ko: '[도토리] 계정 잠금 안내', en: '[Dotore] Account Locked Notice', vi: '[Dotore] Thông báo tài khoản bị khóa' },
        description: { ko: '로그인 실패로 인한 계정 잠금 안내', en: 'Account lock notification due to login failure', vi: 'Thông báo khóa tài khoản do đăng nhập thất bại' }
      },
    ],
  },
  {
    id: 'order',
    name: {
      ko: '주문',
      en: 'Order',
      vi: 'Đơn hàng',
    },
    templates: [
      {
        id: 6,
        name: { ko: '주문 확인', en: 'Order Confirmation', vi: 'Xác nhận đơn hàng' },
        title: { ko: '[도토리] 주문이 완료되었습니다', en: '[Dotore] Your order has been completed', vi: '[Dotore] Đơn hàng của bạn đã hoàn tất' },
        description: { ko: '주문 완료 시 주문 내역 발송', en: 'Send order details when order is completed', vi: 'Gửi chi tiết đơn hàng khi đơn hàng hoàn tất' }
      },
      {
        id: 7,
        name: { ko: '결제 확인', en: 'Payment Confirmation', vi: 'Xác nhận thanh toán' },
        title: { ko: '[도토리] 결제가 완료되었습니다', en: '[Dotore] Payment has been completed', vi: '[Dotore] Thanh toán đã hoàn tất' },
        description: { ko: '결제 완료 시 결제 내역 발송', en: 'Send payment details when payment is completed', vi: 'Gửi chi tiết thanh toán khi thanh toán hoàn tất' }
      },
      {
        id: 8,
        name: { ko: '배송 알림', en: 'Shipping Notification', vi: 'Thông báo giao hàng' },
        title: { ko: '[도토리] 상품이 배송되었습니다', en: '[Dotore] Your product has been shipped', vi: '[Dotore] Sản phẩm của bạn đã được giao hàng' },
        description: { ko: '상품 배송 시작 시 배송 정보 발송', en: 'Send shipping information when product shipping starts', vi: 'Gửi thông tin giao hàng khi bắt đầu giao hàng sản phẩm' }
      },
      {
        id: 9,
        name: { ko: '배송 완료', en: 'Delivery Completed', vi: 'Giao hàng hoàn tất' },
        title: { ko: '[도토리] 배송이 완료되었습니다', en: '[Dotore] Delivery has been completed', vi: '[Dotore] Giao hàng đã hoàn tất' },
        description: { ko: '배송 완료 시 완료 알림 발송', en: 'Send completion notification when delivery is completed', vi: 'Gửi thông báo hoàn tất khi giao hàng hoàn tất' }
      },
      {
        id: 10,
        name: { ko: '주문 취소', en: 'Order Cancelled', vi: 'Hủy đơn hàng' },
        title: { ko: '[도토리] 주문이 취소되었습니다', en: '[Dotore] Your order has been cancelled', vi: '[Dotore] Đơn hàng của bạn đã bị hủy' },
        description: { ko: '주문 취소 시 취소 내역 발송', en: 'Send cancellation details when order is cancelled', vi: 'Gửi chi tiết hủy đơn khi đơn hàng bị hủy' }
      },
    ],
  },
  {
    id: 'payment',
    name: {
      ko: '결제',
      en: 'Payment',
      vi: 'Thanh toán',
    },
    templates: [
      {
        id: 11,
        name: { ko: '결제 성공', en: 'Payment Success', vi: 'Thanh toán thành công' },
        title: { ko: '[도토리] 결제가 성공적으로 완료되었습니다', en: '[Dotore] Payment has been successfully completed', vi: '[Dotore] Thanh toán đã hoàn tất thành công' },
        description: { ko: '결제 성공 시 결제 정보 발송', en: 'Send payment information when payment is successful', vi: 'Gửi thông tin thanh toán khi thanh toán thành công' }
      },
      {
        id: 12,
        name: { ko: '결제 실패', en: 'Payment Failed', vi: 'Thanh toán thất bại' },
        title: { ko: '[도토리] 결제 실패 안내', en: '[Dotore] Payment Failed Notice', vi: '[Dotore] Thông báo thanh toán thất bại' },
        description: { ko: '결제 실패 시 실패 사유 발송', en: 'Send failure reason when payment fails', vi: 'Gửi lý do thất bại khi thanh toán thất bại' }
      },
      {
        id: 13,
        name: { ko: '환불 완료', en: 'Refund Completed', vi: 'Hoàn tiền hoàn tất' },
        title: { ko: '[도토리] 환불이 완료되었습니다', en: '[Dotore] Refund has been completed', vi: '[Dotore] Hoàn tiền đã hoàn tất' },
        description: { ko: '환불 완료 시 환불 내역 발송', en: 'Send refund details when refund is completed', vi: 'Gửi chi tiết hoàn tiền khi hoàn tiền hoàn tất' }
      },
    ],
  },
  {
    id: 'notification',
    name: {
      ko: '알림',
      en: 'Notification',
      vi: 'Thông báo',
    },
    templates: [
      {
        id: 14,
        name: { ko: '시스템 공지', en: 'System Notice', vi: 'Thông báo hệ thống' },
        title: { ko: '[도토리] 시스템 공지사항', en: '[Dotore] System Notice', vi: '[Dotore] Thông báo hệ thống' },
        description: { ko: '시스템 점검 및 공지사항 발송', en: 'Send system maintenance and announcements', vi: 'Gửi bảo trì hệ thống và thông báo' }
      },
      {
        id: 15,
        name: { ko: '이벤트 알림', en: 'Event Notification', vi: 'Thông báo sự kiện' },
        title: { ko: '[도토리] 특별 이벤트 안내', en: '[Dotore] Special Event Guide', vi: '[Dotore] Hướng dẫn sự kiện đặc biệt' },
        description: { ko: '이벤트 및 프로모션 알림 발송', en: 'Send event and promotion notifications', vi: 'Gửi thông báo sự kiện và khuyến mãi' }
      },
      {
        id: 16,
        name: { ko: '문의 답변', en: 'Inquiry Reply', vi: 'Trả lời yêu cầu' },
        title: { ko: '[도토리] 문의하신 내용에 대한 답변입니다', en: '[Dotore] Reply to your inquiry', vi: '[Dotore] Trả lời yêu cầu của bạn' },
        description: { ko: '문의 답변 완료 시 알림 발송', en: 'Send notification when inquiry reply is completed', vi: 'Gửi thông báo khi trả lời yêu cầu hoàn tất' }
      },
    ],
  },
];

// 수동 메일 더미데이터
export const manualMailGroups: MailGroup[] = [
  {
    id: 'marketing',
    name: {
      ko: '마케팅',
      en: 'Marketing',
      vi: 'Tiếp thị',
    },
    templates: [
      {
        id: 1,
        name: { ko: '뉴스레터', en: 'Newsletter', vi: 'Bản tin' },
        title: { ko: '[도토리] 월간 뉴스레터 - {{month}}월호', en: '[Dotore] Monthly Newsletter - {{month}} Issue', vi: '[Dotore] Bản tin hàng tháng - Số {{month}}' },
        description: { ko: '정기 뉴스레터 발송', en: 'Regular newsletter distribution', vi: 'Phân phối bản tin định kỳ' }
      },
      {
        id: 2,
        name: { ko: '프로모션', en: 'Promotion', vi: 'Khuyến mãi' },
        title: { ko: '🎉 특별 할인 프로모션 안내', en: '🎉 Special Discount Promotion Guide', vi: '🎉 Hướng dẫn khuyến mãi giảm giá đặc biệt' },
        description: { ko: '할인 및 프로모션 안내', en: 'Discount and promotion guide', vi: 'Hướng dẫn giảm giá và khuyến mãi' }
      },
      {
        id: 3,
        name: { ko: '신제품 출시', en: 'New Product Launch', vi: 'Ra mắt sản phẩm mới' },
        title: { ko: '새로운 제품이 출시되었습니다!', en: 'New product has been launched!', vi: 'Sản phẩm mới đã được ra mắt!' },
        description: { ko: '신제품 출시 안내', en: 'New product launch guide', vi: 'Hướng dẫn ra mắt sản phẩm mới' }
      },
      {
        id: 4,
        name: { ko: '계절 인사', en: 'Seasonal Greeting', vi: 'Lời chào mùa' },
        title: { ko: '{{season}} 인사드립니다', en: '{{season}} Greetings', vi: 'Lời chào {{season}}' },
        description: { ko: '명절 및 계절 인사 메일', en: 'Holiday and seasonal greeting email', vi: 'Email chào mừng ngày lễ và mùa' }
      },
    ],
  },
  {
    id: 'customer-service',
    name: {
      ko: '고객 서비스',
      en: 'Customer Service',
      vi: 'Dịch vụ khách hàng',
    },
    templates: [
      {
        id: 5,
        name: { ko: '맞춤 문의', en: 'Custom Inquiry', vi: 'Yêu cầu tùy chỉnh' },
        title: { ko: '문의하신 내용에 대한 답변입니다', en: 'Reply to your inquiry', vi: 'Trả lời yêu cầu của bạn' },
        description: { ko: '고객 맞춤 문의 응답', en: 'Customized customer inquiry response', vi: 'Phản hồi yêu cầu khách hàng tùy chỉnh' }
      },
      {
        id: 6,
        name: { ko: '불만 처리', en: 'Complaint Handling', vi: 'Xử lý khiếu nại' },
        title: { ko: '불편을 드려 죄송합니다 - 처리 안내', en: 'We apologize for the inconvenience - Processing Guide', vi: 'Chúng tôi xin lỗi vì sự bất tiện - Hướng dẫn xử lý' },
        description: { ko: '고객 불만 처리 안내', en: 'Customer complaint handling guide', vi: 'Hướng dẫn xử lý khiếu nại khách hàng' }
      },
      {
        id: 7,
        name: { ko: '피드백 요청', en: 'Feedback Request', vi: 'Yêu cầu phản hồi' },
        title: { ko: '서비스 개선을 위한 피드백 요청', en: 'Feedback request for service improvement', vi: 'Yêu cầu phản hồi để cải thiện dịch vụ' },
        description: { ko: '서비스 피드백 요청', en: 'Service feedback request', vi: 'Yêu cầu phản hồi dịch vụ' }
      },
      {
        id: 8,
        name: { ko: '만족도 조사', en: 'Satisfaction Survey', vi: 'Khảo sát mức độ hài lòng' },
        title: { ko: '고객 만족도 조사 참여 요청', en: 'Request to participate in customer satisfaction survey', vi: 'Yêu cầu tham gia khảo sát mức độ hài lòng khách hàng' },
        description: { ko: '고객 만족도 조사 요청', en: 'Customer satisfaction survey request', vi: 'Yêu cầu khảo sát mức độ hài lòng khách hàng' }
      },
    ],
  },
  {
    id: 'education',
    name: {
      ko: '교육',
      en: 'Education',
      vi: 'Giáo dục',
    },
    templates: [
      {
        id: 9,
        name: { ko: '강의 알림', en: 'Course Notification', vi: 'Thông báo khóa học' },
        title: { ko: '[{{courseName}}] 강의 시작 안내', en: '[{{courseName}}] Course Start Guide', vi: '[{{courseName}}] Hướng dẫn bắt đầu khóa học' },
        description: { ko: '강의 시작 및 마감 알림', en: 'Course start and deadline notifications', vi: 'Thông báo bắt đầu và hạn chót khóa học' }
      },
      {
        id: 10,
        name: { ko: '과제 안내', en: 'Assignment Notice', vi: 'Thông báo bài tập' },
        title: { ko: '[{{courseName}}] 과제 제출 안내', en: '[{{courseName}}] Assignment Submission Guide', vi: '[{{courseName}}] Hướng dẫn nộp bài tập' },
        description: { ko: '과제 제출 안내', en: 'Assignment submission guide', vi: 'Hướng dẫn nộp bài tập' }
      },
      {
        id: 11,
        name: { ko: '수료증 발급', en: 'Certificate Issuance', vi: 'Cấp chứng chỉ' },
        title: { ko: '축하합니다! 수료증이 발급되었습니다', en: 'Congratulations! Your certificate has been issued', vi: 'Chúc mừng! Chứng chỉ của bạn đã được cấp' },
        description: { ko: '과정 수료 시 수료증 발급 안내', en: 'Certificate issuance guide upon course completion', vi: 'Hướng dẫn cấp chứng chỉ khi hoàn thành khóa học' }
      },
    ],
  },
  {
    id: 'admin',
    name: {
      ko: '관리자',
      en: 'Admin',
      vi: 'Quản trị viên',
    },
    templates: [
      {
        id: 12,
        name: { ko: '관리자 공지', en: 'Admin Notice', vi: 'Thông báo quản trị viên' },
        title: { ko: '[관리자 공지] {{subject}}', en: '[Admin Notice] {{subject}}', vi: '[Thông báo quản trị viên] {{subject}}' },
        description: { ko: '관리자 대상 공지사항', en: 'Announcements for administrators', vi: 'Thông báo dành cho quản trị viên' }
      },
      {
        id: 13,
        name: { ko: '보고서 요약', en: 'Report Summary', vi: 'Tóm tắt báo cáo' },
        title: { ko: '[{{period}}] 보고서 요약', en: '[{{period}}] Report Summary', vi: '[{{period}}] Tóm tắt báo cáo' },
        description: { ko: '주간/월간 보고서 발송', en: 'Weekly/monthly report distribution', vi: 'Phân phối báo cáo hàng tuần/tháng' }
      },
      {
        id: 14,
        name: { ko: '시스템 경고', en: 'System Alert', vi: 'Cảnh báo hệ thống' },
        title: { ko: '[긴급] 시스템 이상 감지 알림', en: '[Urgent] System Anomaly Detection Alert', vi: '[Khẩn cấp] Cảnh báo phát hiện bất thường hệ thống' },
        description: { ko: '시스템 이상 감지 시 경고 발송', en: 'Send alert when system anomaly is detected', vi: 'Gửi cảnh báo khi phát hiện bất thường hệ thống' }
      },
    ],
  },
  {
    id: 'etc',
    name: {
      ko: '기타',
      en: 'Others',
      vi: 'Khác',
    },
    templates: [],
  },
];
