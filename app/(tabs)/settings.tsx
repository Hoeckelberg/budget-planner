import React from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, Platform, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';

const COFFEE_URL = 'https://buymeacoffee.com/budgetplanner';

interface SettingsItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
}

function SettingsItem({ icon, title, subtitle, onPress, showArrow = true, rightElement }: SettingsItemProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <Pressable onPress={onPress}>
            <View style={[styles.settingsItem, { borderBottomColor: colors.separator }]}>
                <Text style={styles.settingsIcon}>{icon}</Text>
                <View style={styles.settingsContent}>
                    <Text style={[Typography.body, { color: colors.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[Typography.caption1, { color: colors.textSecondary }]}>{subtitle}</Text>
                    )}
                </View>
                {rightElement}
                {showArrow && !rightElement && (
                    <Text style={{ color: colors.textTertiary }}>›</Text>
                )}
            </View>
        </Pressable>
    );
}

export default function SettingsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const handleBuyMeCoffee = async () => {
        await Linking.openURL(COFFEE_URL);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <Text style={[Typography.largeTitle, { color: colors.text }]}>
                        Einstellungen
                    </Text>
                </Animated.View>

                {/* Premium Card */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Pressable>
                        <GlassCard style={styles.premiumCard}>
                            <View style={styles.premiumBadge}>
                                <Text style={styles.premiumBadgeText}>PRO</Text>
                            </View>
                            <Text style={styles.premiumIcon}>✨</Text>
                            <Text style={[Typography.title2, { color: colors.text }]}>
                                Premium freischalten
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, textAlign: 'center' }]}>
                                Unbegrenzte Sparziele, Szenarien-Planner, Widgets und mehr!
                            </Text>
                            <View style={styles.premiumButton}>
                                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                                    Nur €2,99 einmalig
                                </Text>
                            </View>
                        </GlassCard>
                    </Pressable>
                </Animated.View>

                {/* Account Section */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
                        KONTO
                    </Text>
                    <GlassCard style={styles.settingsGroup}>
                        <SettingsItem icon="👤" title="Profil" subtitle="Max Mustermann" />
                        <SettingsItem icon="🔔" title="Benachrichtigungen" />
                        <SettingsItem icon="☁️" title="Cloud-Sync" subtitle="Verbunden" />
                    </GlassCard>
                </Animated.View>

                {/* App Settings */}
                <Animated.View entering={FadeInDown.delay(400)}>
                    <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
                        APP
                    </Text>
                    <GlassCard style={styles.settingsGroup}>
                        <SettingsItem icon="💰" title="Währung" subtitle="Euro (€)" />
                        <SettingsItem icon="📅" title="Monatsstart" subtitle="1. des Monats" />
                        <SettingsItem icon="🌙" title="Erscheinungsbild" subtitle="Dunkel" />
                        <SettingsItem icon="🏷️" title="Kategorien verwalten" />
                    </GlassCard>
                </Animated.View>

                {/* Data */}
                <Animated.View entering={FadeInDown.delay(500)}>
                    <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
                        DATEN
                    </Text>
                    <GlassCard style={styles.settingsGroup}>
                        <SettingsItem icon="📤" title="Daten exportieren" subtitle="CSV, PDF" />
                        <SettingsItem icon="📥" title="Daten importieren" />
                        <SettingsItem icon="🗑️" title="Alle Daten löschen" />
                    </GlassCard>
                </Animated.View>

                {/* Support */}
                <Animated.View entering={FadeInDown.delay(600)}>
                    <Text style={[Typography.footnote, { color: colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
                        SUPPORT
                    </Text>
                    <GlassCard style={styles.settingsGroup}>
                        <SettingsItem icon="❓" title="Hilfe & FAQ" />
                        <SettingsItem icon="📧" title="Feedback senden" />
                        <SettingsItem icon="⭐" title="App bewerten" />
                        <SettingsItem icon="📜" title="Datenschutz" />
                    </GlassCard>
                </Animated.View>

                {/* Buy me a Coffee */}
                <Animated.View entering={FadeInDown.delay(700)}>
                    <Pressable onPress={handleBuyMeCoffee}>
                        <GlassCard style={styles.coffeeCard}>
                            <Text style={styles.coffeeIcon}>☕</Text>
                            <View style={styles.coffeeContent}>
                                <Text style={[Typography.headline, { color: colors.text }]}>
                                    Gefällt dir die App?
                                </Text>
                                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                    Unterstütze die Entwicklung mit einem Kaffee!
                                </Text>
                            </View>
                            <Text style={{ color: '#FFD60A', fontSize: 20 }}>→</Text>
                        </GlassCard>
                    </Pressable>
                </Animated.View>

                {/* Version */}
                <Animated.View entering={FadeInDown.delay(800)}>
                    <Text style={[Typography.caption2, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.xl }]}>
                        Budget Planner v1.0.0{'\n'}
                        Made with ❤️ in Germany
                    </Text>
                </Animated.View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 60 : Spacing.xl,
    },
    premiumCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginTop: Spacing.lg,
        borderColor: '#FFD60A',
        borderWidth: 1,
    },
    premiumBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#FFD60A',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    premiumBadgeText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 12,
    },
    premiumIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    premiumButton: {
        backgroundColor: '#007AFF',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.md,
    },
    settingsGroup: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: 0,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 0.5,
        gap: Spacing.md,
    },
    settingsIcon: {
        fontSize: 22,
    },
    settingsContent: {
        flex: 1,
    },
    coffeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
        backgroundColor: 'rgba(255,214,10,0.1)',
        borderColor: '#FFD60A',
        borderWidth: 1,
    },
    coffeeIcon: {
        fontSize: 36,
        marginRight: Spacing.md,
    },
    coffeeContent: {
        flex: 1,
    },
});
