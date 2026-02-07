/**
 * Protected Route Component
 * Redirects to auth screen if user is not authenticated
 */

import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!user && !inAuthGroup) {
            // Redirect to auth if not logged in
            router.replace('/auth');
        } else if (user && inAuthGroup) {
            // Redirect to tabs if logged in
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.tint} />
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.background,
    },
});
