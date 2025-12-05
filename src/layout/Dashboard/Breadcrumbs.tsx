import Breadcrumbs from '@mui/material/Breadcrumbs';
import LinkMaterial from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { autoMailGroups, manualMailGroups } from '../../data/mockMailData';
import { MultilingualContent } from '../../types/multilingual';

export default function CustomBreadcrumbs() {
  const { t, language } = useLanguage();
  const location = useLocation();

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{
        mb: 2,
        '& .MuiBreadcrumbs-separator': { color: 'text.secondary' },
        '& .MuiTypography-root': { fontSize: '0.75rem' },
        '& .MuiLink-root': { fontSize: '0.75rem', color: 'text.secondary' },
      }}
    >
      {location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail') || location.pathname === '/mail-group' ? (
        (() => {
          const isAutoMail = location.pathname.startsWith('/auto-mail');
          const pathParts = location.pathname.split('/').filter(Boolean);
          const templateId = pathParts.length >= 3 ? pathParts[2] : null;

          let templateName: MultilingualContent | null = null;
          if (templateId) {
            const groups = isAutoMail ? autoMailGroups : manualMailGroups;
            for (const group of groups) {
              const template = group.templates.find((t) => t.id === templateId);
              if (template) {
                templateName = template.name;
                break;
              }
            }
          }

          if (templateName) {
            let templateNameText: string;
            if (typeof templateName === 'string') {
              templateNameText = templateName;
            } else {
              templateNameText = templateName[language] || '';
            }
            return [
              <LinkMaterial
                key="mail"
                component={Link}
                to={isAutoMail ? '/auto-mail' : '/manual-mail'}
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {t('breadcrumb.mail')}
              </LinkMaterial>,
              <LinkMaterial
                key="type"
                component={Link}
                to={isAutoMail ? '/auto-mail' : '/manual-mail'}
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {isAutoMail ? t('breadcrumb.mail.auto') : t('breadcrumb.mail.manual')}
              </LinkMaterial>,
              <Typography key="template" color="text.primary" sx={{ fontWeight: 500 }}>
                {templateNameText}
              </Typography>,
            ];
          } else {
            return [
              <LinkMaterial
                key="mail"
                component={Link}
                to={isAutoMail ? '/auto-mail' : '/manual-mail'}
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {t('breadcrumb.mail')}
              </LinkMaterial>,
              <Typography key="type" color="text.primary" sx={{ fontWeight: 500 }}>
                {isAutoMail ? t('breadcrumb.mail.auto') : t('breadcrumb.mail.manual')}
              </Typography>,
            ];
          }
        })()
      ) : location.pathname === '/mail-group' ? (
        [
          <LinkMaterial
            key="mail"
            component={Link}
            to="/mail-group"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('breadcrumb.mail')}
          </LinkMaterial>,
          <Typography key="group" color="text.primary" sx={{ fontWeight: 500 }}>
            {t('breadcrumb.mail.group')}
          </Typography>,
        ]
      ) : location.pathname === '/mail-history' ? (
        [
          <LinkMaterial
            key="mail"
            component={Link}
            to="/mail-group"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('breadcrumb.mail')}
          </LinkMaterial>,
          <Typography key="history" color="text.primary" sx={{ fontWeight: 500 }}>
            {t('breadcrumb.mail.history')}
          </Typography>,
        ]
      ) : location.pathname === '/member' ? (
        [
          <Typography key="member" color="text.primary" sx={{ fontWeight: 500 }}>
            {t('breadcrumb.member')}
          </Typography>,
        ]
      ) : (
        [
          <LinkMaterial
            key="inquiry"
            component={Link}
            to="/"
            color="text.secondary"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('breadcrumb.inquiry')}
          </LinkMaterial>,
          location.pathname === '/' ? (
            <Typography key="list" color="text.primary" sx={{ fontWeight: 500 }}>
              {t('breadcrumb.inquiry.list')}
            </Typography>
          ) : (
            <Typography key="analysis" color="text.primary" sx={{ fontWeight: 500 }}>
              {t(`breadcrumb.inquiry.${location.pathname === '/analysis' ? 'analysis' : 'list'}`)}
            </Typography>
          ),
        ]
      )}
    </Breadcrumbs>
  );
}
