const STORAGE_KEY = 'inquiries';

export const getInquiries = (): any[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveInquiries = (inquiries: any[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// 메일 템플릿 저장/불러오기
const TEMPLATE_STORAGE_KEY = 'mail_templates';

export interface SavedTemplate {
  groupId: string;
  templateId: string;
  title: string;
  content: string;
}

export const getTemplate = (groupId: string, templateId: string): SavedTemplate | null => {
  const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (stored) {
    const templates: SavedTemplate[] = JSON.parse(stored);
    return templates.find((t) => t.groupId === groupId && t.templateId === templateId) || null;
  }
  return null;
};

export const saveTemplate = (groupId: string, templateId: string, title: string, content: string) => {
  const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  let templates: SavedTemplate[] = stored ? JSON.parse(stored) : [];

  const existingIndex = templates.findIndex(
    (t) => t.groupId === groupId && t.templateId === templateId
  );

  const templateData: SavedTemplate = {
    groupId,
    templateId,
    title,
    content,
  };

  if (existingIndex >= 0) {
    templates[existingIndex] = templateData;
  } else {
    templates.push(templateData);
  }

  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
};

// 자동 발송 설정 저장/불러오기
const AUTO_SEND_STORAGE_KEY = 'mail_auto_send_settings';

export interface AutoSendSetting {
  groupId: string;
  templateId: string;
  enabled: boolean;
}

export const getAutoSendSettings = (): AutoSendSetting[] => {
  const stored = localStorage.getItem(AUTO_SEND_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const getAutoSendSetting = (groupId: string, templateId: string): boolean => {
  const settings = getAutoSendSettings();
  const setting = settings.find((s) => s.groupId === groupId && s.templateId === templateId);
  return setting ? setting.enabled : true; // 기본값은 true (활성화)
};

export const saveAutoSendSetting = (groupId: string, templateId: string, enabled: boolean) => {
  const settings = getAutoSendSettings();
  const existingIndex = settings.findIndex(
    (s) => s.groupId === groupId && s.templateId === templateId
  );

  const setting: AutoSendSetting = {
    groupId,
    templateId,
    enabled,
  };

  if (existingIndex >= 0) {
    settings[existingIndex] = setting;
  } else {
    settings.push(setting);
  }

  localStorage.setItem(AUTO_SEND_STORAGE_KEY, JSON.stringify(settings));
};

// 발송그룹 저장/불러오기
const MAIL_GROUP_STORAGE_KEY = 'mail_groups';

export interface SendGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const getSendGroups = (): SendGroup[] => {
  const stored = localStorage.getItem(MAIL_GROUP_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // 이전 형식(객체)인 경우 마이그레이션
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        // 이전 형식: Record<string, SendGroup[]>
        const allGroups: SendGroup[] = [];
        Object.values(parsed).forEach((groups: any) => {
          if (Array.isArray(groups)) {
            groups.forEach((group: any) => {
              // type 필드 제거
              const { type, ...groupWithoutType } = group;
              allGroups.push(groupWithoutType);
            });
          }
        });
        // 마이그레이션된 데이터 저장
        saveSendGroups(allGroups);
        return allGroups;
      }
      // 배열인 경우 그대로 반환
      if (Array.isArray(parsed)) {
        // type 필드가 있는 경우 제거 및 그룹 이름에서 " 자동 발송" 제거 (하위 호환성)
        const migrated = parsed.map((group: any) => {
          const { type, ...groupWithoutType } = group;
          // 그룹 이름에서 " 자동 발송" 제거
          if (groupWithoutType.name && typeof groupWithoutType.name === 'string') {
            groupWithoutType.name = groupWithoutType.name.replace(/\s*자동\s*발송\s*/g, '').trim();
          }
          return groupWithoutType;
        });
        // 마이그레이션된 데이터 저장
        if (migrated.some((g: any, i: number) => g.name !== parsed[i]?.name)) {
          saveSendGroups(migrated);
        }
        return migrated;
      }
    } catch (e) {
      console.error('Failed to parse send groups:', e);
      return [];
    }
  }
  return [];
};

export const saveSendGroups = (groups: SendGroup[]) => {
  localStorage.setItem(MAIL_GROUP_STORAGE_KEY, JSON.stringify(groups));
};

export const addSendGroup = (name: string, description?: string): SendGroup => {
  const groups = getSendGroups();
  const newGroup: SendGroup = {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  groups.push(newGroup);
  saveSendGroups(groups);
  return newGroup;
};

export const updateSendGroup = (id: string, name: string, description?: string): boolean => {
  const groups = getSendGroups();
  const index = groups.findIndex((g) => g.id === id);
  if (index >= 0) {
    groups[index] = {
      ...groups[index],
      name,
      description,
      updatedAt: new Date().toISOString(),
    };
    saveSendGroups(groups);
    return true;
  }
  return false;
};

export const deleteSendGroup = (id: string): boolean => {
  const groups = getSendGroups();
  const filtered = groups.filter((g) => g.id !== id);
  if (filtered.length !== groups.length) {
    saveSendGroups(filtered);
    return true;
  }
  return false;
};

// 수동 메일 템플릿 그룹 저장/불러오기
const MANUAL_MAIL_GROUPS_STORAGE_KEY = 'manual_mail_groups';

export const getManualMailGroups = (): any[] | null => {
  const stored = localStorage.getItem(MANUAL_MAIL_GROUPS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse manual mail groups:', e);
      return null;
    }
  }
  return null;
};

export const saveManualMailGroups = (groups: any[]) => {
  localStorage.setItem(MANUAL_MAIL_GROUPS_STORAGE_KEY, JSON.stringify(groups));
};

// 자동 메일 템플릿 그룹 저장/불러오기
const AUTO_MAIL_GROUPS_STORAGE_KEY = 'auto_mail_groups';

export const getAutoMailGroups = (): any[] | null => {
  const stored = localStorage.getItem(AUTO_MAIL_GROUPS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse auto mail groups:', e);
      return null;
    }
  }
  return null;
};

export const saveAutoMailGroups = (groups: any[]) => {
  localStorage.setItem(AUTO_MAIL_GROUPS_STORAGE_KEY, JSON.stringify(groups));
};
