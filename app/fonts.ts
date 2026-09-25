import localFont from 'next/font/local';

export const nyghtSerif = localFont({
  src: [
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-Dark.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../assets/fonts/nyght serif/NyghtSerif-DarkItalic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-nyght-serif',
  display: 'swap',
});

export const hostGrotesk = localFont({
  src: [
    {
      path: '../assets/fonts/host grotesk/HostGrotesk-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: '../assets/fonts/host grotesk/HostGrotesk-Italic-VariableFont_wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-host-grotesk',
  display: 'swap',
});