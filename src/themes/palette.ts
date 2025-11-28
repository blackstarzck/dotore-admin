// third-party
import { presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { extendPaletteWithChannels } from '../utils/colorUtils';

const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];

// ==============================|| GREY COLORS BUILDER ||============================== //

function buildGrey() {
  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  return [...greyPrimary, ...greyAscent, ...greyConstant];
}

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(_presetColor: string = 'default') {
  const lightColors = { ...presetPalettes, grey: buildGrey() };
  const lightPaletteColor = ThemeOption(lightColors);

  const commonColor = { common: { black: '#000', white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(lightPaletteColor);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  // Dark palette
  const darkPaletteColor = ThemeOption(lightColors);
  const extendedDark = extendPaletteWithChannels(darkPaletteColor);

  return {
    light: {
      mode: 'light',
      ...extendedCommon,
      ...extendedLight,
      text: {
        primary: extendedLight.grey[700],
        secondary: extendedLight.grey[500],
        disabled: extendedLight.grey[400]
      },
      action: { disabled: extendedLight.grey[300] },
      divider: extendedLight.grey[200],
      background: {
        paper: extendedLight.grey[0],
        default: extendedLight.grey.A50
      }
    },
    dark: {
      mode: 'dark',
      ...extendedCommon,
      ...extendedDark,
      text: {
        primary: extendedDark.grey[0], // #ffffff - mantis 스타일: 밝은 텍스트
        secondary: extendedDark.grey[200], // #f0f0f0 - mantis 스타일: 보조 텍스트
        disabled: extendedDark.grey[400] // #bfbfbf - mantis 스타일: 비활성 텍스트
      },
      action: { disabled: extendedDark.grey[600] }, // #8c8c8c
      divider: extendedDark.grey[700], // #595959 - mantis 스타일: 구분선
      background: {
        paper: extendedDark.grey[800], // #262626 - mantis 스타일: 카드 배경
        default: extendedDark.grey[900] // #141414 - mantis 스타일: 기본 배경
      }
    }
  };
}
