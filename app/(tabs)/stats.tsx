import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text, Platform, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { Typography, Spacing, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { DonutChart } from '@/components/DonutChart';
import { LineChart } from '@/components/LineChart';
import { useAuth } from '@/contexts/AuthContext';
import { useMonthlyStats, useCategoryBreakdown } from '@/hooks/useSupabase';

export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const { user } = useAuth();

    // Load real data from Supabase
    const { stats, loading: statsLoading } = useMonthlyStats(user?.id, 6);
    const { breakdown, loading: breakdownLoading } = useCategoryBreakdown(user?.id);

    // Format data for line charts
    const incomeData = useMemo(() => {
        return stats.map(s => ({
            label: new Date(s.month).toLocaleDateString('de-DE', { month: 'short' }),
            value: s.income,
        }));
    }, [stats]);

    const expenseData = useMemo(() => {
        return stats.map(s => ({
            label: new Date(s.month).toLocaleDateString('de-DE', { month: 'short' }),
            value: s.expenses,
        }));
    }, [stats]);

    // Format data for category donut chart
    const categoryData = useMemo(() => {
        return breakdown.map(b => ({
            id: b.category_id,
            name: b.category_name,
            amount: b.total_amount,
            color: b.category_color || '#8E8E93',
        }));
    }, [breakdown]);

    // Calculate insights
    const currentMonth = stats[stats.length - 1];
    const previousMonth = stats[stats.length - 2];

    const savingsRate = currentMonth && currentMonth.income > 0
        ? ((currentMonth.net_savings / currentMonth.income) * 100).toFixed(0)
        : 0;

    const totalIncome = stats.reduce((sum, s) => sum + s.income, 0);
    const totalExpenses = stats.reduce((sum, s) => sum + s.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Gradient */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <GlassCard style={styles.headerCard}>
                        <LinearGradient
                            colors={['#007AFF', '#5856D6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerGradient}
                        >
                            <Text style={[Typography.largeTitle, { color: '#FFFFFF' }]}>
                                Statistik
                            </Text>
                            <Text style={[Typography.subhead, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                                Deine Finanzübersicht
                            </Text>
                        </LinearGradient>
                    </GlassCard>
                </Animated.View>

                {/* Summary Cards */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <View style={styles.summaryRow}>
                        <GlassCard style={[styles.summaryCard, { marginRight: 6 }]}>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                Gesamt Einnahmen
                            </Text>
                            <Text style={[Typography.title2, { color: SemanticColors.income, marginTop: 4 }]}>
                                €{totalIncome.toLocaleString('de-DE')}
                            </Text>
                        </GlassCard>
                        <GlassCard style={[styles.summaryCard, { marginLeft: 6 }]}>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                Gesamt Ausgaben
                            </Text>
                            <Text style={[Typography.title2, { color: SemanticColors.expense, marginTop: 4 }]}>
                                €{totalExpenses.toLocaleString('de-DE')}
                            </Text>
                        </GlassCard>
                    </View>
                </Animated.View>

                {/* Income Trend */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        📈 Einnahmen Trend
                    </Text>
                    <GlassCard>
                        {statsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#007AFF" />
                            </View>
                        ) : incomeData.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                                    Noch keine Daten vorhanden
                                </Text>
                            </View>
                        ) : (
                            <LineChart
                                data={incomeData}
                                height={180}
                                lineColor={SemanticColors.income}
                                gradientColors={[SemanticColors.income, 'transparent']}
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Expense Trend */}
                <Animated.View entering={FadeInDown.delay(400).springify()}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        📉 Ausgaben Trend
                    </Text>
                    <GlassCard>
                        {statsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#007AFF" />
                            </View>
                        ) : expenseData.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                                    Noch keine Daten vorhanden
                                </Text>
                            </View>
                        ) : (
                            <LineChart
                                data={expenseData}
                                height={180}
                                lineColor={SemanticColors.expense}
                                gradientColors={[SemanticColors.expense, 'transparent']}
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        🏷️ Ausgaben nach Kategorie
                    </Text>
                    <GlassCard>
                        {breakdownLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#007AFF" />
                            </View>
                        ) : categoryData.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                                    Noch keine Ausgaben vorhanden
                                </Text>
                            </View>
                        ) : (
                            <DonutChart
                                data={categoryData}
                                size={220}
                                strokeWidth={28}
                                centerLabel={`€${totalExpenses.toFixed(0)}`}
                                centerSubLabel="GESAMT"
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Insights */}
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        💡 Insights
                    </Text>

                    {currentMonth && (
                        <GlassCard style={styles.insightCard}>
                            <View style={styles.insightIconContainer}>
                                <Text style={styles.insightIcon}>📊</Text>
                            </View>
                            <View style={styles.insightContent}>
                                <Text style={[Typography.headline, { color: colors.text }]}>
                                    Sparquote: {savingsRate}%
                                </Text>
                                <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4 }]}>
                                    {Number(savingsRate) > 15
                                        ? '🎉 Großartig! Du sparst mehr als der Durchschnitt!'
                                        : '💪 Versuche mindestens 15% zu sparen.'}
                                </Text>
                            </View>
                        </GlassCard>
                    )}

                    {currentMonth && previousMonth && currentMonth.expenses > previousMonth.expenses && (
                        <GlassCard style={styles.insightCardWithMargin}>
                            <View style={styles.insightIconContainer}>
                                <Text style={styles.insightIcon}>⚠️</Text>
                            </View>
                            <View style={styles.insightContent}>
                                <Text style={[Typography.headline, { color: colors.text }]}>
                                    Ausgaben: +{((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses * 100).toFixed(0)}%
                                </Text>
                                <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4 }]}>
                                    Deine Ausgaben sind im Vergleich zum Vormonat gestiegen.
                                </Text>
                            </View>
                        </GlassCard>
                    )}

                    {totalSavings > 0 && (
                        <GlassCard style={styles.insightCardWithMargin}>
                            <View style={styles.insightIconContainer}>
                                <Text style={styles.insightIcon}>💰</Text>
                            </View>
                            <View style={styles.insightContent}>
                                <Text style={[Typography.headline, { color: colors.text }]}>
                                    Gesamt Ersparnis: €{totalSavings.toLocaleString('de-DE')}
                                </Text>
                                <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4 }]}>
                                    In den letzten {stats.length} Monaten gespart
                                </Text>
                            </View>
                        </GlassCard>
                    )}
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
    headerCard: {
        padding: 0,
        overflow: 'hidden',
    },
    headerGradient: {
        padding: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    summaryRow: {
        flexDirection: 'row',
        marginTop: Spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: Spacing.md,
    },
    loadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
    },
    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 150,
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    insightCardWithMargin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    insightIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightIcon: {
        fontSize: 24,
    },
    insightContent: {
        flex: 1,
    },
});
