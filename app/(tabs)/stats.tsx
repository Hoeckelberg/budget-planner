import React, { useMemo, useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Platform,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { Typography, Spacing, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { DonutChart } from '@/components/DonutChart';
import { LineChart } from '@/components/LineChart';
import { useAuth } from '@/contexts/AuthContext';
import { useMonthlyStats, useCategoryBreakdown } from '@/hooks/useSupabase';

// ─── Month Selector ───────────────────────────────────────────────────────────
interface MonthSelectorProps {
    currentOffset: number; // 0 = current month, -1 = last month, etc.
    onChange: (offset: number) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function MonthSelector({ currentOffset, onChange }: MonthSelectorProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const displayDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + currentOffset);
        return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }, [currentOffset]);

    const isCurrentMonth = currentOffset === 0;

    return (
        <View style={monthStyles.row}>
            <Pressable
                style={monthStyles.arrow}
                onPress={() => onChange(currentOffset - 1)}
            >
                <Text style={[monthStyles.arrowText, { color: colors.tint }]}>‹</Text>
            </Pressable>

            <Pressable
                onPress={() => !isCurrentMonth && onChange(0)}
                style={monthStyles.labelContainer}
            >
                <Text style={[monthStyles.label, { color: colors.text }]}>{displayDate}</Text>
                {!isCurrentMonth && (
                    <Text style={[monthStyles.resetHint, { color: colors.tint }]}>→ Heute</Text>
                )}
            </Pressable>

            <Pressable
                style={[monthStyles.arrow, { opacity: isCurrentMonth ? 0.3 : 1 }]}
                onPress={() => !isCurrentMonth && onChange(currentOffset + 1)}
                disabled={isCurrentMonth}
            >
                <Text style={[monthStyles.arrowText, { color: colors.tint }]}>›</Text>
            </Pressable>
        </View>
    );
}

const monthStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    arrow: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowText: { fontSize: 28, fontWeight: '300' },
    labelContainer: {
        alignItems: 'center',
        gap: 2,
    },
    label: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    resetHint: {
        fontSize: 11,
        fontWeight: '600',
    },
});

// ─── Delta Badge ──────────────────────────────────────────────────────────────
function DeltaBadge({ delta, unit = '%' }: { delta: number; unit?: string }) {
    if (delta === 0 || isNaN(delta)) return null;
    const isPositive = delta > 0;
    const bg = isPositive ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)';
    const fg = isPositive ? SemanticColors.expense : SemanticColors.income;
    const sign = isPositive ? '▲' : '▼';

    return (
        <View style={[deltaStyles.badge, { backgroundColor: bg }]}>
            <Text style={[deltaStyles.text, { color: fg }]}>
                {sign} {Math.abs(delta).toFixed(1)}{unit}
            </Text>
        </View>
    );
}

const deltaStyles = StyleSheet.create({
    badge: {
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const { user } = useAuth();

    // Month selection state (0 = current, negative = past)
    const [monthOffset, setMonthOffset] = useState(0);
    const handleMonthChange = useCallback((offset: number) => {
        setMonthOffset(offset);
    }, []);

    // Always load last 7 months so we can compare current vs previous
    const { stats, loading: statsLoading } = useMonthlyStats(user?.id, 7);
    const { breakdown, loading: breakdownLoading } = useCategoryBreakdown(user?.id);

    // Resolve the month index for the selected offset
    const selectedIndex = useMemo(() => {
        const latest = stats.length - 1;
        const idx = latest + monthOffset;
        return Math.max(0, Math.min(idx, latest));
    }, [stats, monthOffset]);

    const currentMonth = stats[selectedIndex];
    const previousMonth = stats[selectedIndex - 1];

    // Chart data — show up to selected month
    const incomeData = useMemo(() =>
        stats.slice(0, selectedIndex + 1).map(s => ({
            label: new Date(s.month + '-01').toLocaleDateString('de-DE', { month: 'short' }),
            value: s.income,
        })), [stats, selectedIndex]);

    const expenseData = useMemo(() =>
        stats.slice(0, selectedIndex + 1).map(s => ({
            label: new Date(s.month + '-01').toLocaleDateString('de-DE', { month: 'short' }),
            value: s.expenses,
        })), [stats, selectedIndex]);

    const categoryData = useMemo(() =>
        breakdown.map(b => ({
            id: b.category_id,
            name: b.category_name,
            amount: b.total_amount,
            color: b.category_color || '#8E8E93',
        })), [breakdown]);

    const totalIncome = currentMonth?.income ?? 0;
    const totalExpenses = currentMonth?.expenses ?? 0;
    const netSavings = currentMonth?.net_savings ?? (totalIncome - totalExpenses);

    const incomeDelta = previousMonth && previousMonth.income > 0
        ? ((totalIncome - previousMonth.income) / previousMonth.income) * 100
        : 0;
    const expenseDelta = previousMonth && previousMonth.expenses > 0
        ? ((totalExpenses - previousMonth.expenses) / previousMonth.expenses) * 100
        : 0;

    const savingsRate = totalIncome > 0
        ? ((netSavings / totalIncome) * 100)
        : 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Title */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>Statistik</Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
                        Deine Finanzübersicht
                    </Text>
                </Animated.View>

                {/* Month Selector */}
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <MonthSelector currentOffset={monthOffset} onChange={handleMonthChange} />
                </Animated.View>

                {/* KPI Summary Row */}
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <View style={styles.kpiRow}>
                        {/* Income KPI */}
                        <GlassCard style={[styles.kpiCard, { marginRight: 6 }]} elevation="base">
                            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Einnahmen</Text>
                            <Text style={[styles.kpiValue, { color: SemanticColors.income }]}>
                                €{totalIncome.toLocaleString('de-DE')}
                            </Text>
                            <DeltaBadge delta={incomeDelta} />
                        </GlassCard>

                        {/* Expense KPI */}
                        <GlassCard style={[styles.kpiCard, { marginLeft: 6 }]} elevation="base">
                            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Ausgaben</Text>
                            <Text style={[styles.kpiValue, { color: SemanticColors.expense }]}>
                                €{totalExpenses.toLocaleString('de-DE')}
                            </Text>
                            <DeltaBadge delta={expenseDelta} />
                        </GlassCard>
                    </View>

                    {/* Savings Rate KPI */}
                    <GlassCard style={styles.savingsCard} elevation="elevated">
                        <View style={styles.savingsRow}>
                            <View>
                                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Sparquote</Text>
                                <Text style={[styles.kpiValue, {
                                    color: savingsRate >= 15 ? SemanticColors.income : SemanticColors.warning,
                                    fontSize: 28,
                                }]}>
                                    {savingsRate.toFixed(1)}%
                                </Text>
                            </View>
                            <View style={styles.savingsPill}>
                                <Text style={styles.savingsPillText}>
                                    {savingsRate >= 15 ? '🎯 Ziel erreicht' : '💪 Ziel: 15%'}
                                </Text>
                            </View>
                        </View>
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4 }]}>
                            Ersparnis: €{netSavings.toLocaleString('de-DE')}
                        </Text>
                    </GlassCard>
                </Animated.View>

                {/* Income Trend */}
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>EINNAHMEN TREND</Text>
                    <GlassCard elevation="base">
                        {statsLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={SemanticColors.income} />
                            </View>
                        ) : incomeData.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={[Typography.body, { color: colors.textSecondary }]}>Keine Daten</Text>
                            </View>
                        ) : (
                            <LineChart
                                data={incomeData}
                                height={160}
                                lineColor={SemanticColors.income}
                                gradientColors={[SemanticColors.income, 'transparent']}
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Expense Trend */}
                <Animated.View entering={FadeInDown.delay(320).springify()}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AUSGABEN TREND</Text>
                    <GlassCard elevation="base">
                        {statsLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={SemanticColors.expense} />
                            </View>
                        ) : expenseData.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={[Typography.body, { color: colors.textSecondary }]}>Keine Daten</Text>
                            </View>
                        ) : (
                            <LineChart
                                data={expenseData}
                                height={160}
                                lineColor={SemanticColors.expense}
                                gradientColors={[SemanticColors.expense, 'transparent']}
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(390).springify()}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NACH KATEGORIE</Text>
                    <GlassCard elevation="base">
                        {breakdownLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={colors.tint} />
                            </View>
                        ) : categoryData.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={[Typography.body, { color: colors.textSecondary }]}>
                                    Noch keine Ausgaben
                                </Text>
                            </View>
                        ) : (
                            <DonutChart
                                data={categoryData}
                                size={200}
                                strokeWidth={24}
                                centerLabel={`€${Math.round(totalExpenses).toLocaleString('de-DE')}`}
                                centerSubLabel="GESAMT"
                            />
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Insights */}
                {currentMonth && (
                    <Animated.View entering={FadeInDown.delay(460).springify()}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INSIGHTS</Text>

                        {savingsRate > 0 && (
                            <GlassCard style={styles.insightCard} elevation="base">
                                <View style={styles.insightIconWrap}>
                                    <Text style={{ fontSize: 22 }}>{savingsRate >= 15 ? '🎉' : '💪'}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[Typography.headline, { color: colors.text }]}>
                                        Sparquote: {savingsRate.toFixed(0)}%
                                    </Text>
                                    <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 3 }]}>
                                        {savingsRate >= 15
                                            ? 'Super! Du liegst über dem Empfehlungswert von 15%.'
                                            : 'Versuch, mindestens 15% deines Einkommens zu sparen.'}
                                    </Text>
                                </View>
                            </GlassCard>
                        )}

                        {previousMonth && currentMonth.expenses > previousMonth.expenses && (
                            <GlassCard style={[styles.insightCard, { marginTop: Spacing.sm }]} elevation="base">
                                <View style={styles.insightIconWrap}>
                                    <Text style={{ fontSize: 22 }}>⚠️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[Typography.headline, { color: colors.text }]}>
                                        Ausgaben +{expenseDelta.toFixed(0)}%
                                    </Text>
                                    <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 3 }]}>
                                        Mehr als letzten Monat (€{previousMonth.expenses.toLocaleString('de-DE')}).
                                    </Text>
                                </View>
                            </GlassCard>
                        )}
                    </Animated.View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
    },
    pageTitle: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37,
        marginBottom: 4,
    },
    kpiRow: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    kpiCard: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    kpiLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    kpiValue: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    savingsCard: {
        marginBottom: Spacing.lg,
    },
    savingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    savingsPill: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    savingsPillText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: Spacing.sm,
        marginTop: Spacing.lg,
    },
    loadingBox: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBox: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    insightIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
});
