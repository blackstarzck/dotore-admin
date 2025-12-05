import { Email, Send } from '@mui/icons-material';

// icons
const icons = {
  Email,
  Send,
};

// ==============================|| MENU ITEMS - MAIL ||============================== //

const mail = {
  id: 'mail',
  title: 'menu.mail',
  type: 'group' as const,
  icon: icons.Email,
  children: [
    {
      id: 'mail-send',
      title: 'menu.mail.send',
      type: 'collapse' as const,
      icon: icons.Send,
      children: [
        {
          id: 'mail-auto',
          title: 'menu.mail.auto',
          type: 'item' as const,
          url: '/auto-mail',
        },
        {
          id: 'mail-manual',
          title: 'menu.mail.manual',
          type: 'item' as const,
          url: '/manual-mail',
        },
      ],
    },
    {
      id: 'mail-management',
      title: 'menu.mail.management',
      type: 'collapse' as const,
      icon: icons.Email,
      children: [
        {
          id: 'mail-group',
          title: 'menu.mail.group',
          type: 'item' as const,
          url: '/mail-group',
          icon: icons.Email,
        },
        {
          id: 'mail-history',
          title: 'menu.mail.history',
          type: 'item' as const,
          url: '/mail-history',
          icon: icons.Email,
        },
      ],
    },
  ],
};

export default mail;
