// Run `npm install @capacitor/core @capacitor/cli` before using this file.
// This file is excluded from Next.js TypeScript compilation (see tsconfig.json).

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CapacitorConfig } = require('@capacitor/cli');

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.skilllink.app',
  appName: 'SkillLink',
  webDir: 'out',          // use `next export` → generates static 'out' folder
  server: {
    androidScheme: 'https',
    // During development: uncomment + set your local IP
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#24389c',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

module.exports = config;
