// project import
import inquiry from './inquiry';
import mail from './mail';
import member from './member';

// ==============================|| MENU ITEMS ||============================== //

export interface MenuItem {
  id: string;
  title: string;
  type: 'group' | 'item' | 'collapse';
  url?: string;
  icon?: React.ComponentType;
  children?: MenuItem[];
  disabled?: boolean;
  target?: boolean;
}

const menuItems = {
  items: [inquiry, mail, member],
};

export default menuItems;
