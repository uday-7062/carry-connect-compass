
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4939966089aa43bc88f9ecc605bb0316',
  appName: 'carry-connect-compass',
  webDir: 'dist',
  server: {
    url: 'https://49399660-89aa-43bc-88f9-ecc605bb0316.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6",
      showSpinner: false
    }
  }
};

export default config;
