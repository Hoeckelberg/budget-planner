import React, { useCallback } from 'react';
import { View, StyleSheet, Text, Alert, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { Typography, Spacing, BorderRadius, SemanticColors, Gradients } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { GlassCard } from './GlassCard';
import { CircularProgress } from './CircularProgress';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { PressableScale } from './ui/PressableScale';
import { Pressable } from 'react-native';

// ─── BalanceCard ─────────────────────────────────────────────────────────────
interface BalanceCardProps {
    availableAmount: number;
    totalBudget: number;
    month?: string;
    onPress?: () => void;
}

export function BalanceCard({
    availableAmount,
    totalBudget,
    month = 'diesen Monat',
    onPress,
}: BalanceCardProps) {
    const progress = totalBudget > 0 ? Math.max(0, availableAmount / totalBudget) : 0;
    const isNegative = availableAmount < 0;

    // Gradient shifts red if balance is negative
    const gradientColors = isNegative
        ? ['#C0392B', '#922B21'] as [string, string]
        : Gradients.primary;

    return (
        <PressableScale onPress={onPress} style={styles.heroCardWrapper}>
            <GlassCard style={styles.heroCard} elevation="overlay" radius={BorderRadius.xl}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.heroContent}>
                    {/* Left: Balance */}
                    <View style={styles.heroLeft}>
                        <Text style={styles.heroLabel}>Verfügbar</Text>

                        <AnimatedNumber
                            value={Math.abs(availableAmount)}
                            prefix={isNegative ? '-€' : '€'}
                            decimals={0}
                            duration={700}
                            style={styles.heroAmount}
                        />

                        <Text style={styles.heroSub}>{month}</Text>
                    </View>

                    {/* Right: Progress Ring */}
                    <View style={styles.heroRight}>
                        <CircularProgress
                            percentage={Math.min(progress * 100, 100)}
                            size={84}
                            strokeWidth={7}
                            color="#FFFFFF"
                            backgroundColor="rgba(255,255,255,0.18)"
                        />
                        <Text style={styles.heroRingLabel}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </View>
                </View>
            </GlassCard>
        </PressableScale>
    );
}

// ─── QuickStatRow ─────────────────────────────────────────────────────────────
interface QuickStatRowProps {
    income: number;
    expenses: number;
}

export function QuickStatRow({ income, expenses }: QuickStatRowProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.statsRow}>
            {/* Income */}
            <GlassCard style={[styles.statCard, { marginRight: 6 }]} elevation="base">
                <View style={styles.statIconRow}>
                    <View style={[styles.statDot, { backgroundColor: SemanticColors.income }]} />
                    <Text style={[Typography.caption1, { color: colors.textSecondary, letterSpacing: 0.5 }]}>
                        EINNAHMEN
                    </Text>
                </View>
                <AnimatedNumber
                    value={income}
                    prefix="€"
                    decimals={0}
                    duration={600}
                    style={[styles.statAmount, { color: SemanticColors.income }]}
                />
            </GlassCard>

            {/* Expenses */}
            <GlassCard style={[styles.statCard, { marginLeft: 6 }]} elevation="base">
                <View style={styles.statIconRow}>
                    <View style={[styles.statDot, { backgroundColor: SemanticColors.expense }]} />
                    <Text style={[Typography.caption1, { color: colors.textSecondary, letterSpacing: 0.5 }]}>
                        AUSGABEN
                    </Text>
                </View>
                <AnimatedNumber
                    value={expenses}
                    prefix="€"
                    decimals={0}
                    duration={600}
                    style={[styles.statAmount, { color: SemanticColors.expense }]}
                />
            </GlassCard>
        </View>
    );
}

// ─── TransactionItem ──────────────────────────────────────────────────────────
interface TransactionItemProps {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
    icon: string;
    type: 'income' | 'expense';
    categoryColor?: string;
    isRecurring?: boolean;
    onPress?: () => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function TransactionItem({
    id,
    title,
    category,
    amount,
    date,
    icon,
    type,
    categoryColor,
    isRecurring = false,
    onPress,
    onEdit,
    onDelete,
}: TransactionItemProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const amountColor = type === 'income' ? SemanticColors.income : colors.text;
    const amountPrefix = type === 'income' ? '+€' : '€';
    const accentColor = categoryColor ?? (type === 'income' ? SemanticColors.income : '#5856D6');

    const itemHeight = useSharedValue(72);
    const itemOpacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        height: itemHeight.value,
        opacity: itemOpacity.value,
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    }, [scale]);

    const handleDelete = useCallback(() => {
        Alert.alert('Löschen', 'Transaktion wirklich löschen?', [
            { text: 'Abbrechen', style: 'cancel' },
            {
                text: 'Löschen',
                style: 'destructive',
                onPress: () => {
                    itemOpacity.value = withTiming(0, { duration: 250 });
                    itemHeight.value = withTiming(0, { duration: 300 }, () => {
                        onDelete?.(id);
                    });
                },
            },
        ]);
    }, [id, itemOpacity, itemHeight, onDelete]);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress || (() => { })}
                onLongPress={() => {
                    Alert.alert(title, category, [
                        { text: 'Bearbeiten', onPress: () => onEdit?.(id) },
                        { text: 'Löschen', style: 'destructive', onPress: handleDelete },
                        { text: 'Abbrechen', style: 'cancel' },
                    ]);
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                delayLongPress={300}
                style={Platform.select({ web: { cursor: 'pointer' } as any })}
            >
                <View style={[styles.transactionRow, { borderBottomColor: colors.separator }]}>
                    {/* Left accent bar — category color coding */}
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

                    {/* Icon bubble */}
                    <View style={[styles.iconBubble, { backgroundColor: `${accentColor}20` }]}>
                        <Text style={{ fontSize: 19 }}>{icon}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.transactionInfo}>
                        <View style={styles.titleRow}>
                            <Text
                                style={[Typography.headline, { color: colors.text }]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                            {isRecurring && (
                                <View style={styles.recurringBadge}>
                                    <Text style={styles.recurringText}>↻</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                            {category} · {date}
                        </Text>
                    </View>

                    {/* Amount */}
                    <Text style={[styles.amountText, { color: amountColor }]}>
                        {amountPrefix}{amount.toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
    title: string;
    action?: string;
    onActionPress?: () => void;
}

export function SectionHeader({ title, action, onActionPress }: SectionHeaderProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.sectionHeader}>
            <Text style={[Typography.headline, { color: colors.text, letterSpacing: 0.2 }]}>
                {title}
            </Text>
            {action && (
                <Pressable onPress={onActionPress}>
                    <Text style={[Typography.subhead, { color: colors.tint }]}>{action}</Text>
                </Pressable>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // BalanceCard
    heroCardWrapper: {
        marginBottom: 12,
    },
    heroCard: {
        height: 172,
        padding: 0,
        overflow: 'hidden',
    },
    heroContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    heroLeft: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    heroLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    heroAmount: {
        fontSize: 44,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -2,
        lineHeight: 52,
        // Transparent bg required for AnimatedNumber (TextInput)
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
    },
    heroSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    heroRight: {
        alignItems: 'center',
        gap: 4,
    },
    heroRingLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.5,
    },

    // QuickStatRow
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statAmount: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
        // For AnimatedNumber (TextInput)
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
    },

    // TransactionItem
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        borderBottomWidth: 0.5,
        paddingRight: 16,
        gap: 12,
    },
    accentBar: {
        width: 3,
        height: 36,
        borderRadius: 2,
        marginLeft: 0,
    },
    iconBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recurringBadge: {
        backgroundColor: 'rgba(0,122,255,0.18)',
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    recurringText: {
        color: '#007AFF',
        fontSize: 10,
        fontWeight: '700',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.3,
        fontVariant: ['tabular-nums'] as any,
    },

    // SectionHeader
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: Spacing.lg,
        paddingHorizontal: 2,
    },
});
