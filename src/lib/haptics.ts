import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const haptics = {
    impact: async (style = ImpactStyle.Medium) => {
        await Haptics.impact({ style });
    },

    selection: async () => {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        await Haptics.selectionEnd();
    },

    success: async () => {
        await Haptics.notification({ type: NotificationType.Success });
    },

    warning: async () => {
        await Haptics.notification({ type: NotificationType.Warning });
    },

    error: async () => {
        await Haptics.notification({ type: NotificationType.Error });
    },

    vibrate: async () => {
        await Haptics.vibrate();
    }
};
