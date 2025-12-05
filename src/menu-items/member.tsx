import { PeopleAlt } from '@mui/icons-material';

// icons
const icons = {
  PeopleAlt,
};

// ==============================|| MENU ITEMS - MEMBER ||============================== //

const member = {
  id: 'member',
  title: 'menu.member',
  type: 'group' as const,
  icon: icons.PeopleAlt,
  children: [
    {
      id: 'member-list',
      title: 'menu.member',
      type: 'item' as const,
      url: '/member',
      icon: icons.PeopleAlt,
    },
  ],
};

export default member;
