import React from 'react';
import { View, StyleSheet, Text, Pressable, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { Typography, Spacing, BorderRadius, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { GlassCard } from './GlassCard';
import { CircularProgress } from './CircularProgress';

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

    const progress = totalBudget > 0 ? availableAmount / totalBudget : 0;
    const scale = useSharedValue(1);

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
                <GlassCard style={styles.heroCard} intensity="high">
                    <LinearGradient
                        colors={['#007AFF', '#5856D6']} // Classic Apple Blue Gradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBackground}
                    >
                        <View style={styles.heroContent}>
                            {/* Available Amount */}
                            <View style={styles.heroLeft}>
                                <Text style={styles.heroAmount}>
                                    €{Math.round(availableAmount).toLocaleString('de-DE')}
                                </Text>
                                <Text style={styles.heroLabel}>Verfügbar</Text>
                            </View>

                            {/* Circular Progress */}
                            <View style={styles.heroRight}>
                                <CircularProgress
                                    percentage={Math.min(progress * 100, 100)}
                                    size={80}
                                    strokeWidth={8}
                                    color="#FFFFFF"
                                    backgroundColor="rgba(255, 255, 255, 0.2)"
                                />
                            </View>
                        </View>
                    </LinearGradient>
                </GlassCard>
            </Animated.View>
        </Pressable>
    );
}

interface QuickStatRowProps {
    income: number;
    expenses: number;
}

/**
 * QuickStatRow - Apple-style Income/Expense cards (2 Columns)
 */
export function QuickStatRow({ income, expenses }: QuickStatRowProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.statsRow}>
            {/* Income Card */}
            <GlassCard style={[styles.statCard, { marginRight: 6 }]}>
                <View style={styles.statHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                        <Text style={{ color: SemanticColors.income, fontSize: 12, fontWeight: 'bold' }}>↓</Text>
                    </View>
                    <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                        Einkommen
                    </Text>
                </View>
                <Text style={[Typography.body, { fontWeight: '700', color: SemanticColors.income, marginTop: 8, fontSize: 18 }]}>
                    €{income.toLocaleString('de-DE')}
                </Text>
            </GlassCard>

            {/* Expense Card */}
            <GlassCard style={[styles.statCard, { marginLeft: 6 }]}>
                <View style={styles.statHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                        <Text style={{ color: SemanticColors.expense, fontSize: 12, fontWeight: 'bold' }}>↑</Text>
                    </View>
                    <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                        Ausgaben
                    </Text>
                </View>
                <Text style={[Typography.body, { fontWeight: '700', color: SemanticColors.expense, marginTop: 8, fontSize: 18 }]}>
                    €{expenses.toLocaleString('de-DE')}
                </Text>
            </GlassCard>
        </View>
    );
}

interface TransactionItemProps {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
    icon: string;
    type: 'income' | 'expense';
    onPress?: () => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

/**
 * TransactionItem - Single transaction row with swipe actions
 */
export function TransactionItem({
    id,
    title,
    category,
    amount,
    date,
    icon,
    type,
    onPress,
    onEdit,
    onDelete,
}: TransactionItemProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const amountColor = type === 'income' ? SemanticColors.income : colors.text;
    const amountPrefix = type === 'income' ? '+' : '';

    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(72);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        height: itemHeight.value,
        opacity: opacity.value,
    }));

    // Animate swipe actions visibility based on translateX
    const swipeActionsStyle = useAnimatedStyle(() => {
        const isVisible = translateX.value < -10;
        return {
            opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
            pointerEvents: isVisible ? 'auto' : 'none',
        };
    });

    const handleEdit = () => {
        translateX.value = withSpring(0);
        onEdit?.(id);
    };

    const handleDelete = () => {
        translateX.value = withTiming(-400, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 }, () => {
            onDelete?.(id);
        });
    };

    return (
        <View style={{ overflow: 'hidden' }}>
            {/* Swipe Actions Background - Hidden until swipe */}
            <Animated.View style={[styles.swipeActions, swipeActionsStyle]}>
                <Pressable
                    style={[styles.swipeButton, styles.editButton]}
                    onPress={handleEdit}
                >
                    <Text style={styles.swipeButtonText}>✏️</Text>
                </Pressable>
                <Pressable
                    style={[styles.swipeButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
                    <Text style={styles.swipeButtonText}>🗑️</Text>
                </Pressable>
            </Animated.View>

            {/* Main Transaction Item */}
            <Animated.View style={animatedStyle}>
                <Pressable
                    onPress={onPress}
                    onLongPress={() => {
                        translateX.value = withSpring(-140);
                    }}
                    delayLongPress={200}
                >
                    <View style={[styles.transactionItem, { borderBottomColor: colors.separator }]}>
                        <View style={[styles.transactionIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <Text style={{ fontSize: 20 }}>{icon}</Text>
                        </View>

                        <View style={styles.transactionInfo}>
                            <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>{title}</Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                                {category} • {date}
                            </Text>
                        </View>

                        <Text style={[Typography.headline, { color: amountColor, fontSize: 17 }]}>
                            {amountPrefix}{amount < 0 ? amount.toLocaleString('de-DE') : `€${amount.toLocaleString('de-DE')}`}
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
}

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
    // Hero Card (Apple Style)
    heroCard: {
        height: 180,
        marginBottom: 12,
        overflow: 'hidden',
        padding: 0,
        borderRadius: 24,
    },
    gradientBackground: {
        flex: 1,
        padding: 24,
        borderRadius: 24,
    },
    heroContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroLeft: {
        flex: 1,
        justifyContent: 'center',
    },
    heroAmount: {
        fontSize: 42,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 4,
    },
    heroLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    heroRight: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Stats Grid
    statsRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        paddingVertical: 20,
        borderRadius: 20,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Transactions
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5, // Thinner separator for retina
        gap: 12,
        height: 72,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    swipeActions: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    swipeButton: {
        width: 70,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#3A3A3C', // Muted dark gray
    },
    deleteButton: {
        backgroundColor: '#8B3A3A', // Muted dark red
    },
    swipeButtonText: {
        fontSize: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
});
