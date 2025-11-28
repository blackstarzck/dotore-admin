import { MultilingualContent } from '../types/multilingual';

const STORAGE_KEY = 'inquiries';

export const getInquiries = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to access localStorage for inquiries:', error);
  }
  return [];
};

export const saveInquiries = (inquiries: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
  } catch (error) {
    console.warn('Failed to save inquiries to localStorage:', error);
  }
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.warn('Failed to access localStorage for auth_token:', error);
    return null;
  }
};

export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.warn('Failed to save auth_token to localStorage:', error);
  }
};

export const removeAuthToken = () => {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.warn('Failed to remove auth_token from localStorage:', error);
  }
};

// 메일 템플릿 저장/불러오기
const TEMPLATE_STORAGE_KEY = 'mail_templates';

export interface SavedTemplate {
  groupId: string;
  templateId: string;
  title: MultilingualContent;
  content: MultilingualContent;
}

// 하위 호환성을 위한 레거시 인터페이스
interface LegacySavedTemplate {
  groupId: string;
  templateId: string;
  title: string | MultilingualContent;
  content: string | MultilingualContent;
}

export const getTemplate = (groupId: string, templateId: string): SavedTemplate | null => {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (stored) {
      const templates: LegacySavedTemplate[] = JSON.parse(stored);
      const template = templates.find((t) => t.groupId === groupId && t.templateId === templateId);

      if (!template) return null;

      // 레거시 형식(단일 문자열)인 경우 다국어 형식으로 변환
      if (typeof template.title === 'string' || typeof template.content === 'string') {
        const migratedTemplate: SavedTemplate = {
          groupId: template.groupId,
          templateId: template.templateId,
          title: typeof template.title === 'string'
            ? { ko: template.title, en: template.title, vi: template.title }
            : template.title,
          content: typeof template.content === 'string'
            ? { ko: template.content, en: template.content, vi: template.content }
            : template.content,
        };
        return migratedTemplate;
      }

      return template as SavedTemplate;
    }
  } catch (error) {
    console.warn('Failed to access localStorage for template:', error);
  }
  return null;
};

export const saveTemplate = (
  groupId: string,
  templateId: string,
  title: MultilingualContent,
  content: MultilingualContent
) => {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    let templates: LegacySavedTemplate[] = stored ? JSON.parse(stored) : [];

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
  } catch (error) {
    console.warn('Failed to save template to localStorage:', error);
  }
};

// 자동 발송 설정 저장/불러오기
const AUTO_SEND_STORAGE_KEY = 'mail_auto_send_settings';

export interface AutoSendSetting {
  groupId: string;
  templateId: string;
  enabled: boolean;
}

export const getAutoSendSettings = (): AutoSendSetting[] => {
  try {
    const stored = localStorage.getItem(AUTO_SEND_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to access localStorage for auto send settings:', error);
  }
  return [];
};

export const getAutoSendSetting = (groupId: string, templateId: string): boolean => {
  const settings = getAutoSendSettings();
  const setting = settings.find((s) => s.groupId === groupId && s.templateId === templateId);
  return setting ? setting.enabled : true; // 기본값은 true (활성화)
};

export const saveAutoSendSetting = (groupId: string, templateId: string, enabled: boolean) => {
  try {
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
  } catch (error) {
    console.warn('Failed to save auto send setting to localStorage:', error);
  }
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
  try {
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
  } catch (error) {
    console.warn('Failed to access localStorage for send groups:', error);
  }
  return [];
};

export const saveSendGroups = (groups: SendGroup[]) => {
  try {
    localStorage.setItem(MAIL_GROUP_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.warn('Failed to save send groups to localStorage:', error);
  }
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

// 하위 호환성: 단일 문자열 name을 MultilingualContent로 변환
const migrateGroupName = (name: string | MultilingualContent): MultilingualContent => {
  if (typeof name === 'string') {
    return {
      ko: name,
      en: name,
      vi: name,
    };
  }
  return name;
};

// 하위 호환성: 템플릿의 단일 문자열 name, title, description을 MultilingualContent로 변환
const migrateTemplateName = (template: any): any => {
  if (!template) return template;

  const migrated: any = { ...template };

  // name 마이그레이션
  if (typeof template.name === 'string') {
    migrated.name = {
      ko: template.name,
      en: template.name,
      vi: template.name,
    };
  }

  // title 마이그레이션
  if (template.title && typeof template.title === 'string') {
    migrated.title = {
      ko: template.title,
      en: template.title,
      vi: template.title,
    };
  }

  // description 마이그레이션
  if (template.description && typeof template.description === 'string') {
    migrated.description = {
      ko: template.description,
      en: template.description,
      vi: template.description,
    };
  }

  return migrated;
};

export const getManualMailGroups = (): any[] | null => {
  try {
    const stored = localStorage.getItem(MANUAL_MAIL_GROUPS_STORAGE_KEY);
    if (stored) {
      try {
        const groups = JSON.parse(stored);
        // 하위 호환성: 단일 문자열 name을 다국어로 변환
        return groups.map((group: any) => ({
          ...group,
          name: migrateGroupName(group.name),
          templates: group.templates ? group.templates.map((template: any) => migrateTemplateName(template)) : [],
        }));
      } catch (e) {
        console.error('Failed to parse manual mail groups:', e);
        return null;
      }
    }
  } catch (error) {
    console.warn('Failed to access localStorage for manual mail groups:', error);
  }
  return null;
};

export const saveManualMailGroups = (groups: any[]) => {
  try {
    localStorage.setItem(MANUAL_MAIL_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.warn('Failed to save manual mail groups to localStorage:', error);
  }
};

// 자동 메일 템플릿 그룹 저장/불러오기
const AUTO_MAIL_GROUPS_STORAGE_KEY = 'auto_mail_groups';

export const getAutoMailGroups = (): any[] | null => {
  try {
    const stored = localStorage.getItem(AUTO_MAIL_GROUPS_STORAGE_KEY);
    if (stored) {
      try {
        const groups = JSON.parse(stored);
        // 하위 호환성: 단일 문자열 name을 다국어로 변환
        return groups.map((group: any) => ({
          ...group,
          name: migrateGroupName(group.name),
          templates: group.templates ? group.templates.map((template: any) => migrateTemplateName(template)) : [],
        }));
      } catch (e) {
        console.error('Failed to parse auto mail groups:', e);
        return null;
      }
    }
  } catch (error) {
    console.warn('Failed to access localStorage for auto mail groups:', error);
  }
  return null;
};

export const saveAutoMailGroups = (groups: any[]) => {
  try {
    localStorage.setItem(AUTO_MAIL_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.warn('Failed to save auto mail groups to localStorage:', error);
  }
};
