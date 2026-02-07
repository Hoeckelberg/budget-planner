import React from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { Typography, Spacing, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { SavingsGoalCard, AnimatedProgressBar } from '@/components/ProgressComponents';

const MOCK_GOALS = [
    { id: '1', title: 'Urlaub 2026', icon: '🏝️', current: 450, target: 2000, color: '#5AC8FA' },
    { id: '2', title: 'Notgroschen', icon: '🛡️', current: 2800, target: 5000, color: '#34C759' },
    { id: '3', title: 'Neues MacBook', icon: '💻', current: 800, target: 2500, color: '#AF52DE' },
    { id: '4', title: 'Investieren', icon: '📈', current: 1200, target: 10000, color: '#007AFF' },
];

export default function GoalsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const totalSaved = MOCK_GOALS.reduce((sum, g) => sum + g.current, 0);
    const totalTarget = MOCK_GOALS.reduce((sum, g) => sum + g.target, 0);

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
                        🎯 Sparziele
                    </Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                        Behalte deine Ziele im Blick
                    </Text>
                </Animated.View>

                {/* Total Progress Card */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <GlassCard style={styles.totalCard} glowColor={SemanticColors.savings}>
                        <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                            Gesamtfortschritt
                        </Text>
                        <Text style={[styles.totalAmount, { color: colors.text }]}>
                            €{totalSaved.toLocaleString('de-DE')}
                        </Text>
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
                            von €{totalTarget.toLocaleString('de-DE')}
                        </Text>
                        <AnimatedProgressBar
                            progress={totalSaved / totalTarget}
                            color={SemanticColors.savings}
                            height={12}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Goals List */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <View style={styles.sectionHeader}>
                        <Text style={[Typography.title3, { color: colors.text }]}>
                            Deine Ziele
                        </Text>
                        <Pressable style={[styles.addButton, { backgroundColor: colors.tint }]}>
                            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>+ Neues Ziel</Text>
                        </Pressable>
                    </View>

                    <View style={styles.goalsList}>
                        {MOCK_GOALS.map((goal, index) => (
                            <Animated.View
                                key={goal.id}
                                entering={FadeInDown.delay(400 + index * 100)}
                            >
                                <SavingsGoalCard
                                    title={goal.title}
                                    icon={goal.icon}
                                    currentAmount={goal.current}
                                    targetAmount={goal.target}
                                    color={goal.color}
                                />
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Motivation Quote */}
                <Animated.View entering={FadeInDown.delay(800)}>
                    <GlassCard style={styles.quoteCard}>
                        <Text style={styles.quoteEmoji}>💪</Text>
                        <Text style={[Typography.headline, { color: colors.text, textAlign: 'center' }]}>
                            "Der beste Zeitpunkt zu sparen war gestern. Der zweitbeste ist heute."
                        </Text>
                    </GlassCard>
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
        gap: Spacing.lg,
    },
    totalCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    totalAmount: {
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: -1,
        marginVertical: Spacing.xs,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    addButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: 20,
    },
    goalsList: {
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    quoteCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginTop: Spacing.lg,
    },
    quoteEmoji: {
        fontSize: 40,
        marginBottom: Spacing.md,
    },
});
