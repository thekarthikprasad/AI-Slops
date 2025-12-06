import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.karth.expensemanager',
    appName: 'Expense Manager',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
