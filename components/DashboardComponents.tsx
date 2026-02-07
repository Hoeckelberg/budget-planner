import React from 'react';
import { View, StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { GlassCard } from './GlassCard';
import { AnimatedProgressBar } from './ProgressComponents';

interface BalanceCardProps {
    availableAmount: number;
    totalBudget: number;
    month?: string;
    onPress?: () => void;
}

/**
 * BalanceCard - Hero card showing remaining budget with animated progress
 */
export function BalanceCard({
    availableAmount,
    totalBudget,
    month = 'diesen Monat',
    onPress,
}: BalanceCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const progress = availableAmount / totalBudget;
    const scale = useSharedValue(1);

    // Determine color based on budget health
    const getHealthColor = () => {
        if (progress > 0.5) return SemanticColors.income;
        if (progress > 0.25) return SemanticColors.warning;
        return SemanticColors.expense;
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={animatedStyle}>
                <GlassCard style={styles.balanceCard} glowColor={getHealthColor()}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.walletIcon}>💰</Text>
                        <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                            Verfügbar {month}
                        </Text>
                    </View>

                    <Text style={[styles.balanceAmount, { color: colors.text }]}>
                        €{availableAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </Text>

                    <View style={styles.progressContainer}>
                        <AnimatedProgressBar
                            progress={progress}
                            color={getHealthColor()}
                            height={10}
                        />
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 8 }]}>
                            {Math.round(progress * 100)}% vom Budget übrig
                        </Text>
                    </View>
                </GlassCard>
            </Animated.View>
        </Pressable>
    );
}

interface QuickStatRowProps {
    income: number;
    expenses: number;
    savings: number;
}

/**
 * QuickStatRow - Horizontal row of income/expense/savings stats
 */
export function QuickStatRow({ income, expenses, savings }: QuickStatRowProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const stats = [
        {
            label: 'Einnahmen',
            value: income,
            color: SemanticColors.income,
            icon: '↓',
        },
        {
            label: 'Ausgaben',
            value: expenses,
            color: SemanticColors.expense,
            icon: '↑',
        },
        {
            label: 'Gespart',
            value: savings,
            color: SemanticColors.savings,
            icon: '💎',
        },
    ];

    return (
        <View style={styles.statRow}>
            {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                    <GlassCard style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                            <Text style={{ color: stat.color, fontSize: 16 }}>{stat.icon}</Text>
                        </View>
                        <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                            {stat.label}
                        </Text>
                        <Text style={[Typography.headline, { color: stat.color }]}>
                            €{stat.value.toLocaleString('de-DE')}
                        </Text>
                    </GlassCard>
                </React.Fragment>
            ))}
        </View>
    );
}

interface TransactionItemProps {
    title: string;
    category: string;
    amount: number;
    date: string;
    icon: string;
    type: 'income' | 'expense';
    onPress?: () => void;
}

/**
 * TransactionItem - Single transaction row with swipe actions
 */
export function TransactionItem({
    title,
    category,
    amount,
    date,
    icon,
    type,
    onPress,
}: TransactionItemProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const amountColor = type === 'income' ? SemanticColors.income : SemanticColors.expense;
    const amountPrefix = type === 'income' ? '+' : '-';

    return (
        <Pressable onPress={onPress}>
            <View style={[styles.transactionItem, { borderBottomColor: colors.separator }]}>
                <View style={[styles.transactionIcon, { backgroundColor: colors.glass }]}>
                    <Text style={{ fontSize: 20 }}>{icon}</Text>
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={[Typography.body, { color: colors.text }]}>{title}</Text>
                    <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                        {category} • {date}
                    </Text>
                </View>

                <Text style={[Typography.headline, { color: amountColor }]}>
                    {amountPrefix}€{Math.abs(amount).toLocaleString('de-DE')}
                </Text>
            </View>
        </Pressable>
    );
}

interface SectionHeaderProps {
    title: string;
    action?: string;
    onActionPress?: () => void;
}

/**
 * SectionHeader - Section title with optional action button
 */
export function SectionHeader({ title, action, onActionPress }: SectionHeaderProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.sectionHeader}>
            <Text style={[Typography.title3, { color: colors.text }]}>{title}</Text>
            {action && (
                <Pressable onPress={onActionPress}>
                    <Text style={[Typography.subhead, { color: colors.tint }]}>{action}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    balanceCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    walletIcon: {
        fontSize: 20,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '700',
        letterSpacing: -1,
        marginVertical: Spacing.md,
    },
    progressContainer: {
        width: '100%',
        marginTop: Spacing.sm,
    },
    statRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        gap: Spacing.md,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
});
