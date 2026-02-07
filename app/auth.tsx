import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import Colors, { Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';

export default function AuthScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const { signIn, signUp, signInWithGoogle } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(email, password, fullName);
                Alert.alert('Erfolg', 'Account erstellt! Bitte bestätige deine E-Mail.');
            } else {
                await signIn(email, password);
            }
        } catch (error: any) {
            Alert.alert('Fehler', error.message || 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            Alert.alert('Fehler', error.message || 'Google Sign-In fehlgeschlagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                {/* Logo/Header */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <Text style={styles.logo}>💰</Text>
                    <Text style={[Typography.largeTitle, { color: colors.text }]}>
                        Budget Planner
                    </Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                        Deine Finanzen im Griff
                    </Text>
                </Animated.View>

                {/* Auth Form */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <GlassCard style={styles.formCard}>
                        {/* Toggle Sign In / Sign Up */}
                        <View style={styles.toggleContainer}>
                            <Pressable
                                style={[
                                    styles.toggleButton,
                                    !isSignUp && { backgroundColor: colors.tint },
                                ]}
                                onPress={() => setIsSignUp(false)}
                            >
                                <Text
                                    style={[
                                        Typography.headline,
                                        { color: !isSignUp ? '#FFFFFF' : colors.textSecondary },
                                    ]}
                                >
                                    Anmelden
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.toggleButton,
                                    isSignUp && { backgroundColor: colors.tint },
                                ]}
                                onPress={() => setIsSignUp(true)}
                            >
                                <Text
                                    style={[
                                        Typography.headline,
                                        { color: isSignUp ? '#FFFFFF' : colors.textSecondary },
                                    ]}
                                >
                                    Registrieren
                                </Text>
                            </Pressable>
                        </View>

                        {/* Full Name (only for sign up) */}
                        {isSignUp && (
                            <View style={styles.inputContainer}>
                                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                    Name
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: colors.glass }]}
                                    placeholder="Max Mustermann"
                                    placeholderTextColor={colors.textTertiary}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                />
                            </View>
                        )}

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                E-Mail
                            </Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: colors.glass }]}
                                placeholder="deine@email.de"
                                placeholderTextColor={colors.textTertiary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                Passwort
                            </Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: colors.glass }]}
                                placeholder="••••••••"
                                placeholderTextColor={colors.textTertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Submit Button */}
                        <Pressable
                            style={[styles.submitButton, { opacity: loading ? 0.6 : 1 }]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={[Typography.headline, { color: '#FFFFFF' }]}>
                                    {isSignUp ? 'Account erstellen' : 'Anmelden'}
                                </Text>
                            )}
                        </Pressable>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>oder</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
                        </View>

                        {/* Google Sign In */}
                        <Pressable
                            style={[styles.googleButton, { backgroundColor: colors.glass }]}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <Text style={{ fontSize: 20 }}>🔐</Text>
                            <Text style={[Typography.body, { color: colors.text }]}>
                                Mit Google anmelden
                            </Text>
                        </Pressable>
                    </GlassCard>
                </Animated.View>

                {/* Footer */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <Text style={[Typography.caption2, { color: colors.textTertiary, textAlign: 'center' }]}>
                        Mit der Anmeldung akzeptierst du unsere{'\n'}
                        Datenschutzrichtlinien und AGB
                    </Text>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
        justifyContent: 'center',
        gap: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    logo: {
        fontSize: 64,
    },
    formCard: {
        gap: Spacing.lg,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    inputContainer: {
        gap: Spacing.xs,
    },
    input: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        fontSize: 17,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginVertical: Spacing.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
});
