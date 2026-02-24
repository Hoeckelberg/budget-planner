import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Alert,
    Pressable,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { Typography, Spacing, SemanticColors, Gradients, BorderRadius, Shadows } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { CircularProgress } from './CircularProgress';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { PressableScale } from './ui/PressableScale';

// ─── BalanceCard ─────────────────────────────────────────────────────────────
interface BalanceCardProps {
    availableAmount: number;
    totalBudget: number;
    month?: string;
    onPress?: () => void;
    changePercent?: number;
}

export function BalanceCard({
    availableAmount,
    totalBudget,
    month = 'diesen Monat',
    onPress,
    changePercent = 0,
}: BalanceCardProps) {
    const isNegative = availableAmount < 0;
    const progress = totalBudget > 0 ? Math.max(0, availableAmount / totalBudget) : 0;

    return (
        <PressableScale onPress={onPress} style={styles.heroWrapper}>
            <LinearGradient
                colors={isNegative ? ['#EF4444', '#F87171'] : Gradients.hero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                {/* Decorative circles */}
                <View style={styles.decCircle1} />
                <View style={styles.decCircle2} />

                <View style={styles.heroContent}>
                    {/* Left */}
                    <View style={styles.heroLeft}>
                        <Text style={styles.heroLabel}>VERFÜGBAR</Text>
                        <AnimatedNumber
                            value={Math.abs(availableAmount)}
                            prefix={isNegative ? '-€' : '€'}
                            decimals={0}
                            duration={700}
                            style={styles.heroAmount}
                        />
                        {changePercent !== 0 && (
                            <View style={styles.changePill}>
                                <Text style={styles.changeText}>
                                    {changePercent > 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(1)}%
                                </Text>
                            </View>
                        )}
                        <Text style={styles.heroSub}>{month}</Text>
                    </View>

                    {/* Right: Ring */}
                    <View style={styles.heroRight}>
                        <CircularProgress
                            percentage={Math.min(progress * 100, 100)}
                            size={80}
                            strokeWidth={7}
                            color="rgba(255,255,255,0.9)"
                            backgroundColor="rgba(255,255,255,0.25)"
                        />
                        <Text style={styles.heroRingLabel}>{Math.round(progress * 100)}%</Text>
                    </View>
                </View>
            </LinearGradient>
        </PressableScale>
    );
}

// ─── QuickStatRow ─────────────────────────────────────────────────────────────
interface QuickStatRowProps {
    income: number;
    expenses: number;
}

export function QuickStatRow({ income, expenses }: QuickStatRowProps) {
    const colors = Colors.light;

    return (
        <View style={styles.statsRow}>
            {/* Income */}
            <View style={[styles.statCard, styles.statCardShadow, { marginRight: 6 }]}>
                <View style={styles.statIconRow}>
                    <View style={[styles.statDot, { backgroundColor: SemanticColors.income }]} />
                    <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.6 }]}>
                        EINNAHMEN
                    </Text>
                </View>
                <AnimatedNumber
                    value={income}
                    prefix="€"
                    decimals={0}
                    duration={600}
                    style={[styles.statAmount, { color: colors.text }]}
                />
                <Text style={[Typography.caption1, { color: SemanticColors.income, fontWeight: '600', marginTop: 2 }]}>
                </Text>
            </View>

            {/* Expenses */}
            <View style={[styles.statCard, styles.statCardShadow, { marginLeft: 6 }]}>
                <View style={styles.statIconRow}>
                    <View style={[styles.statDot, { backgroundColor: SemanticColors.expense }]} />
                    <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.6 }]}>
                        AUSGABEN
                    </Text>
                </View>
                <AnimatedNumber
                    value={expenses}
                    prefix="€"
                    decimals={0}
                    duration={600}
                    style={[styles.statAmount, { color: colors.text }]}
                />
                <Text style={[Typography.caption1, { color: SemanticColors.expense, fontWeight: '600', marginTop: 2 }]}>
                </Text>
            </View>
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
    const colors = Colors.light;
    const amountColor = type === 'income' ? SemanticColors.income : '#1C1C1E';
    const amountPrefix = type === 'income' ? '+€' : '€';
    const accentColor = categoryColor ?? (type === 'income' ? SemanticColors.income : '#7B61FF');

    const [showActions, setShowActions] = React.useState(false);

    const itemOpacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: itemOpacity.value,
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.99, { damping: 20, stiffness: 400 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    }, [scale]);

    const handleDelete = useCallback(() => {
        setShowActions(false);
        Alert.alert('Löschen', 'Transaktion wirklich löschen?', [
            { text: 'Abbrechen', style: 'cancel' },
            {
                text: 'Löschen',
                style: 'destructive',
                onPress: () => {
                    // Optimistic fade, then call onDelete on JS thread directly
                    itemOpacity.value = withTiming(0, { duration: 200 });
                    // Small delay matches animation — no worklet callback needed
                    setTimeout(() => onDelete?.(id), 220);
                },
            },
        ]);
    }, [id, itemOpacity, onDelete]);

    const handleEdit = useCallback(() => {
        setShowActions(false);
        onEdit?.(id);
    }, [id, onEdit]);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={() => showActions ? setShowActions(false) : onPress?.()}
                onLongPress={() => setShowActions(prev => !prev)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                delayLongPress={350}
                style={Platform.select({ web: { cursor: 'pointer' } as any })}
            >
                <View style={[styles.transactionRow, showActions && styles.transactionRowActive]}>
                    {/* Icon bubble */}
                    <View style={[styles.iconBubble, { backgroundColor: `${accentColor}12` }]}>
                        <Text style={{ fontSize: 20 }}>{icon}</Text>
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
                                    <Text style={[styles.recurringText, { color: '#7B61FF' }]}>↻</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                            {category} · {date}
                        </Text>
                    </View>

                    {/* Amount or Actions */}
                    {showActions ? (
                        <View style={styles.actionRow}>
                            <Pressable onPress={handleEdit} hitSlop={8} style={styles.actionBtn}>
                                <Text style={styles.actionIcon}>✏️</Text>
                            </Pressable>
                            <Pressable onPress={handleDelete} hitSlop={8} style={[styles.actionBtn, styles.actionBtnDelete]}>
                                <Text style={styles.actionIcon}>🗑️</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Text style={[styles.amountText, { color: amountColor }]}>
                            {amountPrefix}{amount.toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                        </Text>
                    )}
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
    const colors = Colors.light;

    return (
        <View style={styles.sectionHeader}>
            <Text style={[Typography.title3, { color: colors.text }]}>{title}</Text>
            {action && (
                <Pressable onPress={onActionPress}>
                    <Text style={[Typography.subhead, { color: colors.tint, fontWeight: '600' }]}>{action}</Text>
                </Pressable>
            )}
        </View>
    );
}

// ─── KPICard — reusable metric card for dashboard ──────────────────────────
interface KPICardProps {
    label: string;
    value: string;
    subLabel?: string;
    accentColor?: string;
    icon?: string;
}

export function KPICard({ label, value, subLabel, accentColor = '#7B61FF', icon }: KPICardProps) {
    const colors = Colors.light;

    return (
        <View style={[styles.kpiCard, styles.statCardShadow]}>
            {icon && <Text style={{ fontSize: 20, marginBottom: 8 }}>{icon}</Text>}
            <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.6 }]}>
                {label.toUpperCase()}
            </Text>
            <Text style={[Typography.title2, { color: accentColor, marginTop: 4, letterSpacing: -0.5 }]}>
                {value}
            </Text>
            {subLabel && (
                <Text style={[Typography.caption1, { color: colors.textTertiary, marginTop: 2 }]}>
                    {subLabel}
                </Text>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // BalanceCard
    heroWrapper: { marginBottom: 16 },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        minHeight: 168,
        justifyContent: 'flex-end',
    },
    decCircle1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.08)',
        right: -40,
        top: -60,
    },
    decCircle2: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.06)',
        right: 60,
        bottom: -30,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroLeft: { flex: 1 },
    heroLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    heroAmount: {
        fontSize: 42,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -2,
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
    },
    changePill: {
        marginTop: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    changeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    heroSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 6,
    },
    heroRight: { alignItems: 'center', gap: 4 },
    heroRingLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
    },

    // QuickStatRow
    statsRow: { flexDirection: 'row', marginBottom: 16 },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    statCardShadow: {
        ...Shadows.md,
        ...Platform.select({
            web: { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } as any,
        }),
    },
    statIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statDot: { width: 6, height: 6, borderRadius: 3 },
    statAmount: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        backgroundColor: 'transparent',
        padding: 0,
        borderWidth: 0,
    },

    // KPICard
    kpiCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        padding: 16,
    },

    // TransactionItem
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F3F7',
    },
    transactionRowActive: {
        backgroundColor: '#F4F2FF',
    },
    iconBubble: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    transactionInfo: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    recurringBadge: {
        backgroundColor: 'rgba(123,97,255,0.10)',
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    recurringText: { fontSize: 11, fontWeight: '700' },
    amountText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.3,
        textAlign: 'right',
        // @ts-ignore
        fontVariant: ['tabular-nums'],
    },
    rightColumn: {
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        padding: 3,
        borderRadius: 6,
    },
    actionBtnDelete: {
        marginLeft: 4,
    },
    actionIcon: {
        fontSize: 13,
    },

    // SectionHeader
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: Spacing.lg,
        paddingHorizontal: 2,
    },
});
