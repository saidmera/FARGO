import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cargoswift.app',
  appName: 'CargoSwift',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
