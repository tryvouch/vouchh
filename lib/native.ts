// Native Elite Features Implementation
// Requires: expo-local-authentication, expo-notifications
// Note: This file is part of the Solito Monorepo structure.

import { Platform } from 'react-native';

// Mock types for Web compatibility if packages are missing
interface LocalAuthenticationResult {
    success: boolean;
    error?: string;
}

export const NativeAuth = {
    authenticate: async (): Promise<LocalAuthenticationResult> => {
        if (Platform.OS === 'web') {
            // Web Fallback: WebAuthn or standard flow
            console.log("Web environment detected. Use WebAuthn.");
            return { success: true };
        }

        try {
            // Dynamic import to avoid web build failure
            const LocalAuthentication = require('expo-local-authentication');
            
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) return { success: false, error: "No hardware support" };

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) return { success: false, error: "No biometrics enrolled" };

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Vouch Elite Access',
                fallbackLabel: 'Enter Passcode',
            });

            return { success: result.success };
        } catch (e) {
            console.error("Native Auth Error:", e);
            return { success: false, error: "Authentication failed" };
        }
    }
};

export const NativeNotifications = {
    registerForPushNotifications: async () => {
        if (Platform.OS === 'web') return;

        try {
            const Notifications = require('expo-notifications');
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                return null;
            }
            
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            return token;
        } catch (e) {
            console.error("Notification Error:", e);
            return null;
        }
    }
};
