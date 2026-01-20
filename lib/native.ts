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
            const LocalAuthentication = await import("expo-local-authentication");
            
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) return { success: false, error: "No hardware support" };

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) return { success: false, error: "No biometrics enrolled" };

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Vouch Elite Access',
                fallbackLabel: 'Enter Passcode',
                disableDeviceFallback: false, // MANDATORY: Allow OS fallback (PIN/Pattern)
                cancelLabel: 'Use Password'
            });

            if (!result.success) {
                // If biometric fails/cancels, strictly fallback to Clerk
                console.warn("Biometric failed, enforcing Clerk auth.");
                return { success: false, error: "Authentication failed. Please use your password." };
            }

            return { success: true };
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
            const Notifications = await import("expo-notifications");
            const permissions = await Notifications.getPermissionsAsync() as { status?: string };
            const existingStatus = permissions.status ?? "denied";
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const requestPermissions = await Notifications.requestPermissionsAsync() as { status?: string };
                finalStatus = requestPermissions.status ?? "denied";
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
