import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { GlassCard } from './GlassCard';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    showLabel?: boolean;
    animated?: boolean;
}

/**
 * AnimatedProgressBar - Smooth animated progress indicator
 */
export function AnimatedProgressBar({
    progress,
    color = SemanticColors.savings,
    height = 8,
    showLabel = false,
    animated = true,
}: ProgressBarProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const animatedWidth = useSharedValue(0);

    React.useEffect(() => {
        animatedWidth.value = animated
            ? withSpring(progress, { damping: 15 })
            : progress;
    }, [progress]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${Math.min(animatedWidth.value * 100, 100)}%`,
    }));

    return (
        <View style={styles.container}>
            <View style={[styles.track, { height, backgroundColor: colors.glass }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        { backgroundColor: color, height },
                        progressStyle,
                    ]}
                />
            </View>
            {showLabel && (
                <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4 }]}>
                    {Math.round(progress * 100)}%
                </Text>
            )}
        </View>
    );
}

interface SavingsGoalCardProps {
    title: string;
    icon: string;
    currentAmount: number;
    targetAmount: number;
    color?: string;
    onPress?: () => void;
}

/**
 * SavingsGoalCard - Visual savings goal with animated progress
 */
export function SavingsGoalCard({
    title,
    icon,
    currentAmount,
    targetAmount,
    color = SemanticColors.goal,
    onPress,
}: SavingsGoalCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const progress = currentAmount / targetAmount;
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(scale.value) }],
    }));

    const handlePressIn = () => {
        scale.value = 0.98;
    };

    const handlePressOut = () => {
        scale.value = 1;
    };

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={animatedStyle}>
                <GlassCard style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalIcon}>{icon}</Text>
                        <View style={styles.goalInfo}>
                            <Text style={[Typography.headline, { color: colors.text }]}>
                                {title}
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                €{currentAmount.toLocaleString('de-DE')} / €{targetAmount.toLocaleString('de-DE')}
                            </Text>
                        </View>
                        <Text style={[Typography.headline, { color }]}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </View>
                    <AnimatedProgressBar progress={progress} color={color} />
                </GlassCard>
            </Animated.View>
        </Pressable>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
}

/**
 * StatCard - Compact statistic display with optional trend indicator
 */
export function StatCard({
    label,
    value,
    trend,
    trendValue,
    color,
}: StatCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const trendColors = {
        up: SemanticColors.income,
        down: SemanticColors.expense,
        neutral: colors.textSecondary,
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <GlassCard style={styles.statCard}>
            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                {label}
            </Text>
            <Text style={[Typography.title2, { color: color || colors.text, marginTop: 4 }]}>
                {value}
            </Text>
            {trend && trendValue && (
                <View style={styles.trendContainer}>
                    <Text style={[Typography.caption2, { color: trendColors[trend] }]}>
                        {trendIcons[trend]} {trendValue}
                    </Text>
                </View>
            )}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    track: {
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    fill: {
        borderRadius: BorderRadius.full,
    },
    goalCard: {
        gap: Spacing.md,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    goalIcon: {
        fontSize: 32,
    },
    goalInfo: {
        flex: 1,
    },
    statCard: {
        flex: 1,
        minWidth: 140,
    },
    trendContainer: {
        marginTop: Spacing.xs,
    },
});
