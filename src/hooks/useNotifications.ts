import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotifications() {
    const requestPermissions = async () => {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    };

    const scheduleDailyReminder = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return false;

            // Cancel any existing notifications with ID 1 to avoid duplicates
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "Expense Reminder",
                        body: "Don't forget to log your expenses for today!",
                        id: 1,
                        schedule: {
                            on: {
                                hour: 20, // 8 PM
                                minute: 0,
                            },
                            allowWhileIdle: true,
                        },
                    },
                ],
            });
            return true;
        } catch (error) {
            console.error("Failed to schedule notification:", error);
            return false;
        }
    };

    const cancelReminders = async () => {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
        } catch (error) {
            console.error("Failed to cancel notification:", error);
        }
    };

    return { scheduleDailyReminder, cancelReminders };
}
