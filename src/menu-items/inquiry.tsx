import { SupportAgent } from '@mui/icons-material';

// icons
const icons = {
  SupportAgent,
};

// ==============================|| MENU ITEMS - INQUIRY ||============================== //

const inquiry = {
  id: 'inquiry',
  title: 'menu.inquiry',
  type: 'collapse' as const,
  icon: icons.SupportAgent,
  children: [
    {
      id: 'inquiry-list',
      title: 'menu.inquiry.list',
      type: 'item' as const,
      url: '/',
    },
    {
      id: 'inquiry-analysis',
      title: 'menu.inquiry.analysis',
      type: 'item' as const,
      url: '/analysis',
    },
  ],
};

export default inquiry;
