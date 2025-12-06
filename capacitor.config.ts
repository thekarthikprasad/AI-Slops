import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.karth.expensemanager',
    appName: 'Xpense',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
