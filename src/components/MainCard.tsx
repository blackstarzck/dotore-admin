import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import { SxProps, Theme } from '@mui/material/styles';

interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children: React.ReactNode;
  subheader?: React.ReactNode;
  content?: boolean;
  contentSX?: SxProps<Theme>;
  darkTitle?: boolean;
  divider?: boolean;
  elevation?: number;
  secondary?: React.ReactNode;
  shadow?: string;
  sx?: SxProps<Theme>;
  title?: React.ReactNode;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
}

export default function MainCard({
  border = true,
  boxShadow,
  children,
  subheader,
  content = true,
  contentSX = {},
  darkTitle,
  divider = true,
  elevation,
  secondary,
  shadow,
  sx = {},
  title,
  codeHighlight = false,
  codeString,
  modal = false,
  ...others
}: MainCardProps) {
  return (
    <Card
      elevation={elevation || 0}
      sx={(theme) => ({
        position: 'relative',
        ...(border && { border: `1px solid ${(theme.vars.palette.grey as any).A800 || theme.vars.palette.grey[800]}` }),
        borderRadius: 1,
        boxShadow: boxShadow && !border ? shadow || theme.vars.customShadows.z1 : 'inherit',
        ':hover': { boxShadow: boxShadow ? shadow || theme.vars.customShadows.z1 : 'inherit' },
        ...(codeHighlight && {
          '& pre': { margin: 0, padding: '12px !important', fontFamily: theme.typography.fontFamily, fontSize: '0.75rem' }
        }),
        ...(modal && {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc(100% - 50px)`, sm: 'auto' },
          maxWidth: 768
        }),
        ...(typeof sx === 'function' ? sx(theme) : sx || {})
      })}
      {...others}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader
          sx={{ p: 2.5 }}
          slotProps={{
            title: { variant: darkTitle ? 'h4' : 'subtitle1' },
            action: { sx: { m: '0px auto', alignSelf: 'center' } }
          }}
          title={title}
          action={secondary}
          subheader={subheader}
        />
      )}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && (
        <CardContent sx={contentSX}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
}
