import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cargoswift.app',
  appName: 'CargoSwift',
  webDir: 'dist', // This tells Capacitor to look in Vite's output folder
  server: {
    androidScheme: 'https'
  }
};

export default config;
