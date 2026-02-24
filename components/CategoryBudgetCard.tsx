import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import Colors, { Typography, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import type { BudgetWithSpend } from '@/hooks/data/useBudgets';

interface CategoryBudgetCardProps {
    budget: BudgetWithSpend;
    /** Stagger delay for progress bar animation */
    delay?: number;
}

export function CategoryBudgetCard({ budget, delay = 0 }: CategoryBudgetCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const barWidth = useSharedValue(0);

    useEffect(() => {
        barWidth.value = withDelay(
            delay,
            withTiming(budget.progress, {
                duration: 800,
                easing: Easing.out(Easing.cubic),
            })
        );
    }, [budget.progress, delay, barWidth]);

    const animatedBar = useAnimatedStyle(() => ({
        width: `${barWidth.value * 100}%` as any,
    }));

    const barColor = budget.isOverspent
        ? SemanticColors.expense
        : budget.progress > 0.8
            ? SemanticColors.warning
            : budget.categoryColor;

    return (
        <View style={styles.card}>
            {/* Left: Icon */}
            <View style={[styles.iconBubble, { backgroundColor: `${budget.categoryColor}18` }]}>
                <Text style={{ fontSize: 18 }}>{budget.categoryIcon}</Text>
            </View>

            {/* Center: Info + Bar */}
            <View style={styles.center}>
                <View style={styles.topRow}>
                    <Text style={[Typography.headline, { color: colors.text }]} numberOfLines={1}>
                        {budget.categoryName}
                    </Text>
                    {budget.isOverspent && (
                        <View style={styles.overspentBadge}>
                            <Text style={styles.overspentText}>ÜBERZOGEN</Text>
                        </View>
                    )}
                </View>

                {/* Progress Track */}
                <View style={[styles.track, { backgroundColor: '#F2F3F7' }]}>
                    <Animated.View
                        style={[styles.fill, { backgroundColor: barColor }, animatedBar]}
                    />
                </View>

                {/* Amount row */}
                <View style={styles.amountRow}>
                    <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                        €{budget.spent.toLocaleString('de-DE')} ausgegeben
                    </Text>
                    <Text style={[Typography.caption1, {
                        color: budget.isOverspent ? SemanticColors.expense : colors.textSecondary,
                        fontWeight: '600',
                    }]}>
                        {budget.isOverspent
                            ? `+€${(budget.spent - budget.limit).toLocaleString('de-DE')}`
                            : `€${budget.remaining.toLocaleString('de-DE')} übrig`
                        }
                    </Text>
                </View>
            </View>

            {/* Right: Limit */}
            <Text style={[Typography.footnote, { color: colors.textTertiary, width: 48, textAlign: 'right' }]}>
                €{budget.limit.toLocaleString('de-DE')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    iconBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    center: {
        flex: 1,
        gap: 5,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    track: {
        height: 5,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
        minWidth: 4,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    overspentBadge: {
        backgroundColor: 'rgba(255,59,48,0.15)',
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    overspentText: {
        color: SemanticColors.expense,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
