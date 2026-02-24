/**
 * Statistics Screen — Premium financial intelligence dashboard
 * Features: Interactive balance timeline curve, tap-to-select donut,
 * financial insight engine, month-over-month KPIs with delta badges
 */
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
import Colors, { Typography, Spacing, SemanticColors, BorderRadius, Shadows } from '@/constants/Colors';
import { GlassCard } from '@/components/GlassCard';
import { BalanceTimeline, TimelinePoint } from '@/components/BalanceTimeline';
import { InteractiveDonut, DonutSegment } from '@/components/InteractiveDonut';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useMonthlyStats } from '@/hooks/useSupabase';

// ─── Month Selector ───────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function MonthSelector({ offset, onChange }: { offset: number; onChange: (o: number) => void }) {
    const colors = Colors.light;
    const label = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + offset);
        return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }, [offset]);

    return (
        <View style={msStyles.row}>
            <Pressable style={msStyles.btn} onPress={() => onChange(offset - 1)}>
                <Text style={[msStyles.arrow, { color: colors.tint }]}>‹</Text>
            </Pressable>
            <Pressable onPress={() => offset !== 0 && onChange(0)}>
                <Text style={[msStyles.label, { color: colors.text }]}>{label}</Text>
                {offset !== 0 && (
                    <Text style={[Typography.caption2, { color: colors.tint, textAlign: 'center' }]}>Heute</Text>
                )}
            </Pressable>
            <Pressable
                style={[msStyles.btn, { opacity: offset >= 0 ? 0.3 : 1 }]}
                onPress={() => offset < 0 && onChange(offset + 1)}
                disabled={offset >= 0}
            >
                <Text style={[msStyles.arrow, { color: colors.tint }]}>›</Text>
            </Pressable>
        </View>
    );
}

const msStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    arrow: { fontSize: 28, fontWeight: '300' },
    label: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
});

// ─── Delta Badge ──────────────────────────────────────────────────────────────
function DeltaBadge({ delta, invert = false }: { delta: number; invert?: boolean }) {
    if (!delta || isNaN(delta)) return null;
    const up = delta > 0;
    const isGood = invert ? !up : up;
    return (
        <View style={[dStyles.badge, { backgroundColor: isGood ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)' }]}>
            <Text style={[dStyles.txt, { color: isGood ? SemanticColors.income : SemanticColors.expense }]}>
                {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </Text>
        </View>
    );
}
const dStyles = StyleSheet.create({
    badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
    txt: { fontSize: 11, fontWeight: '700' },
});

// ─── KPI Metric Card ──────────────────────────────────────────────────────────
function KPICard({
    label, value, delta, invertDelta, sub, accent,
}: { label: string; value: string; delta?: number; invertDelta?: boolean; sub?: string; accent?: string }) {
    const colors = Colors.light;
    return (
        <View style={[kpiStyles.card, kpiStyles.shadow]}>
            <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '700', letterSpacing: 0.8 }]}>
                {label.toUpperCase()}
            </Text>
            <Text style={[kpiStyles.val, { color: accent ?? colors.text }]}>{value}</Text>
            {delta !== undefined && <DeltaBadge delta={delta} invert={invertDelta} />}
            {sub && <Text style={[Typography.caption2, { color: colors.textTertiary, marginTop: 4 }]}>{sub}</Text>}
        </View>
    );
}
const kpiStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        padding: 16,
        minHeight: 90,
    },
    shadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } as any }),
    },
    val: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginVertical: 6 },
});

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({
    emoji, title, body, accent,
}: { emoji: string; title: string; body: string; accent?: string }) {
    const colors = Colors.light;
    return (
        <View style={[insStyles.card, insStyles.shadow]}>
            <View style={[insStyles.icon, { backgroundColor: `${accent ?? colors.tint}12` }]}>
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[Typography.headline, { color: colors.text }]}>{title}</Text>
                <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 3, lineHeight: 18 }]}>{body}</Text>
            </View>
        </View>
    );
}
const insStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    shadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } as any }),
    },
    icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

// ─── Balance timeline computation ─────────────────────────────────────────────
function computeTimeline(
    rawTransactions: any[],
    year: number,
    month: number           // 0-indexed
): TimelinePoint[] {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Filter to this month, sort chronologically
    const monthly = rawTransactions
        .filter(t => {
            const d = new Date(t.transaction_date);
            return d >= startOfMonth && d <= endOfMonth;
        })
        .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

    if (monthly.length === 0) return [];

    // Build day-by-day cumulative balances
    let running = 0;
    const byDate: Record<string, number> = {};
    for (const t of monthly) {
        const delta = t.type === 'income' ? t.amount : -t.amount;
        running += delta;
        byDate[t.transaction_date] = running;
    }

    // Expand to every day in the month
    const points: TimelinePoint[] = [];
    let lastKnown = 0;
    const today = new Date();
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const d = new Date(year, month, day);
        if (d > today) break;
        const iso = d.toISOString().split('T')[0];
        if (byDate[iso] !== undefined) lastKnown = byDate[iso];
        points.push({
            date: iso,
            label: `${day} ${MONTHS[month]}`,
            balance: lastKnown,
        });
    }

    // Downsample if too many points (keep at most 30 for perf)
    if (points.length > 30) {
        const step = Math.ceil(points.length / 30);
        return points.filter((_, i) => i % step === 0 || i === points.length - 1);
    }
    return points;
}

// ─── Insights Engine ──────────────────────────────────────────────────────────
interface Insight {
    emoji: string;
    title: string;
    body: string;
    accent?: string;
}

function buildInsights(
    income: number,
    expenses: number,
    incomeDelta: number,
    expenseDelta: number,
    topExpCat: string | null,
    topExpAmt: number,
    biggestTx: { title: string; amount: number } | null,
): Insight[] {
    const insights: Insight[] = [];
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    if (savingsRate >= 20) insights.push({ emoji: '🏆', title: `Sparquote ${savingsRate.toFixed(0)}%`, body: 'Außergewöhnlich! Du liegst weit über dem empfohlenen Wert von 15%.', accent: SemanticColors.income });
    else if (savingsRate >= 15) insights.push({ emoji: '🎯', title: `Sparquote ${savingsRate.toFixed(0)}%`, body: 'Gut! Über dem Empfehlungswert. Weiter so.', accent: SemanticColors.income });
    else if (savingsRate > 0) insights.push({ emoji: '💪', title: `Sparquote ${savingsRate.toFixed(0)}%`, body: 'Versuch 15% zu sparen. Kleine Einsparungen machen den Unterschied.', accent: '#F59E0B' });
    else if (savingsRate < 0) insights.push({ emoji: '⚠️', title: 'Ausgaben über Einnahmen', body: 'Deine Ausgaben übersteigen das Einkommen diesen Monat.', accent: SemanticColors.expense });

    if (expenseDelta > 15) insights.push({ emoji: '📈', title: `Ausgaben +${expenseDelta.toFixed(0)}% ggü. Vormonat`, body: topExpCat ? `${topExpCat} ist deine größte Kategorie (€${topExpAmt.toLocaleString('de-DE')}).` : 'Deutlich höher als letzten Monat.', accent: SemanticColors.expense });
    else if (expenseDelta < -10) insights.push({ emoji: '✂️', title: `Ausgaben ${expenseDelta.toFixed(0)}% gesunken`, body: 'Gut eingespart im Vergleich zum Vormonat.', accent: SemanticColors.income });

    if (biggestTx) insights.push({ emoji: '💰', title: `Größte Transaktion: €${biggestTx.amount.toLocaleString('de-DE')}`, body: biggestTx.title, accent: '#7B61FF' });

    if (incomeDelta > 5) insights.push({ emoji: '🚀', title: `Einnahmen +${incomeDelta.toFixed(0)}%`, body: 'Dein Einkommen ist gewachsen.', accent: SemanticColors.income });

    return insights.slice(0, 3);
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StatsScreen() {
    const colors = Colors.light;
    const { user } = useAuth();
    const [monthOffset, setMonthOffset] = useState(0);
    const [donutMode, setDonutMode] = useState<'expense' | 'income'>('expense');
    const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
    const handleMonthChange = useCallback((o: number) => setMonthOffset(o), []);

    const { transactions, loading: txLoading } = useTransactions(user?.id);
    const { stats, loading: statsLoading } = useMonthlyStats(user?.id, 12);

    // ─── Current/previous month index ──────────────────────────────────────
    const selectedIndex = useMemo(() =>
        Math.max(0, Math.min((stats.length - 1) + monthOffset, stats.length - 1)),
        [stats, monthOffset]);

    const current = stats[selectedIndex];
    const previous = stats[selectedIndex - 1];

    // ─── KPI values ────────────────────────────────────────────────────────
    const income = current?.income ?? 0;
    const expenses = current?.expenses ?? 0;
    const net = current?.net_savings ?? (income - expenses);
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    const incomeDelta = previous?.income > 0 ? ((income - previous.income) / previous.income) * 100 : 0;
    const expenseDelta = previous?.expenses > 0 ? ((expenses - previous.expenses) / previous.expenses) * 100 : 0;

    // ─── Current selected month date ────────────────────────────────────────
    const selectedDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        return { year: d.getFullYear(), month: d.getMonth() };
    }, [monthOffset]);

    // ─── Balance timeline data ──────────────────────────────────────────────
    const timelineData = useMemo((): TimelinePoint[] => {
        if (!transactions.length) return [];
        return computeTimeline(transactions, selectedDate.year, selectedDate.month);
    }, [transactions, selectedDate.year, selectedDate.month]);

    // ─── Donut chart data — month-scoped, computed from transactions ────────
    const monthTransactions = useMemo(() =>
        transactions.filter(t => {
            const d = new Date(t.transaction_date);
            return d.getFullYear() === selectedDate.year && d.getMonth() === selectedDate.month;
        }), [transactions, selectedDate.year, selectedDate.month]);

    const expenseSegments = useMemo((): DonutSegment[] => {
        const byCat: Record<string, { name: string; color: string; amount: number }> = {};
        for (const t of monthTransactions.filter(tx => tx.type === 'expense')) {
            const cat = (t as any).categories;
            const catId = t.category_id || 'other';
            if (!byCat[catId]) byCat[catId] = { name: cat?.name ?? 'Sonstiges', color: cat?.color ?? '#9CA3AF', amount: 0 };
            byCat[catId].amount += t.amount;
        }
        return Object.entries(byCat)
            .filter(([, v]) => v.amount > 0)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.amount - a.amount);
    }, [monthTransactions]);

    const incomeSegments = useMemo((): DonutSegment[] => {
        const byCat: Record<string, { name: string; color: string; amount: number }> = {};
        for (const t of monthTransactions.filter(tx => tx.type === 'income')) {
            const cat = (t as any).categories;
            const catId = t.category_id || 'other';
            if (!byCat[catId]) byCat[catId] = { name: cat?.name ?? 'Sonstiges', color: cat?.color ?? '#7B61FF', amount: 0 };
            byCat[catId].amount += t.amount;
        }
        return Object.entries(byCat)
            .filter(([, v]) => v.amount > 0)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.amount - a.amount);
    }, [monthTransactions]);

    const activeSegments = donutMode === 'expense' ? expenseSegments : incomeSegments;

    // ─── Insights data ─────────────────────────────────────────────────────
    const topExpense = expenseSegments[0] ?? null;

    const biggestTx = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        const yr = d.getFullYear();
        const mo = d.getMonth();
        const monthly = transactions.filter(t => {
            const td = new Date(t.transaction_date);
            return td.getFullYear() === yr && td.getMonth() === mo && t.type === 'expense';
        });
        if (!monthly.length) return null;
        const top = monthly.reduce((a, b) => a.amount > b.amount ? a : b);
        return { title: top.description || 'Transaktion', amount: top.amount };
    }, [transactions, monthOffset]);

    const insights = useMemo(() =>
        buildInsights(income, expenses, incomeDelta, expenseDelta, topExpense?.name ?? null, topExpense?.amount ?? 0, biggestTx),
        [income, expenses, incomeDelta, expenseDelta, topExpense, biggestTx]);

    const isLoading = txLoading || statsLoading;

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Page title */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>Statistik</Text>
                </Animated.View>

                {/* Month selector */}
                <Animated.View entering={FadeInDown.delay(90).springify()}>
                    <MonthSelector offset={monthOffset} onChange={handleMonthChange} />
                </Animated.View>

                {/* ─── FEATURE 1: Balance Timeline ─────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(130).springify()}>
                    <View style={[styles.section, styles.cardShadow]}>
                        <Text style={[styles.sectionTag, { color: colors.textSecondary }]}>BALANCE VERLAUF</Text>
                        {isLoading ? (
                            <View style={styles.loader}><ActivityIndicator color={colors.tint} /></View>
                        ) : timelineData.length < 2 ? (
                            <View style={styles.loader}>
                                <Text style={{ fontSize: 28 }}>📊</Text>
                                <Text style={[Typography.subhead, { color: colors.textSecondary, marginTop: 8 }]}>
                                    Noch zu wenig Daten
                                </Text>
                            </View>
                        ) : (
                            <BalanceTimeline
                                data={timelineData}
                                height={200}
                                positiveColor="#7B61FF"
                                negativeColor="#EF4444"
                            />
                        )}
                    </View>
                </Animated.View>

                {/* ─── KPI Cards ─────────────────────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(190).springify()}>
                    {/* Net savings hero */}
                    <View style={[styles.heroCard, styles.cardShadow]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionTag, { color: colors.textSecondary }]}>NETTO GESPART</Text>
                            <Text style={[styles.heroVal, { color: net >= 0 ? colors.tint : SemanticColors.expense }]}>
                                €{net.toLocaleString('de-DE')}
                            </Text>
                        </View>
                        <View style={[styles.savingsPill, {
                            backgroundColor: savingsRate >= 15 ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
                        }]}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: savingsRate >= 15 ? SemanticColors.income : '#F59E0B' }}>
                                {savingsRate.toFixed(0)}% {'\n'}Sparquote
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Income / Expense row */}
                <Animated.View entering={FadeInDown.delay(230).springify()}>
                    <View style={styles.kpiRow}>
                        <KPICard
                            label="Einnahmen"
                            value={`€${income.toLocaleString('de-DE')}`}
                            delta={incomeDelta}
                            accent={SemanticColors.income}
                        />
                        <View style={{ width: 12 }} />
                        <KPICard
                            label="Ausgaben"
                            value={`€${expenses.toLocaleString('de-DE')}`}
                            delta={expenseDelta}
                            invertDelta
                            accent={SemanticColors.expense}
                        />
                    </View>
                </Animated.View>

                {/* ─── FEATURE 2: Interactive Donut ───────────────────────── */}
                <Animated.View entering={FadeInDown.delay(290).springify()}>
                    <View style={[styles.section, styles.cardShadow]}>
                        <InteractiveDonut
                            data={activeSegments}
                            mode={donutMode}
                            onModeChange={setDonutMode}
                            selectedId={selectedSegmentId}
                            onSelect={setSelectedSegmentId}
                        />
                        {activeSegments.length === 0 && !isLoading && (
                            <View style={styles.loader}>
                                <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                                    Keine {donutMode === 'expense' ? 'Ausgaben' : 'Einnahmen'}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* ─── Top KPI details row ─────────────────────────────────── */}
                {expenseSegments.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(330).springify()}>
                        <View style={styles.kpiRow}>
                            <KPICard
                                label="Größte Ausgabe"
                                value={`€${(expenseSegments[0]?.amount ?? 0).toLocaleString('de-DE')}`}
                                sub={expenseSegments[0]?.name}
                                accent="#F59E0B"
                            />
                            <View style={{ width: 12 }} />
                            <KPICard
                                label="Kategorien"
                                value={`${expenseSegments.length}`}
                                sub="mit Ausgaben"
                                accent="#7B61FF"
                            />
                        </View>
                    </Animated.View>
                )}

                {/* ─── Financial Insights ─────────────────────────────────── */}
                {insights.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(370).springify()}>
                        <Text style={[styles.sectionTag, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>INSIGHTS</Text>
                        <View style={{ gap: 10 }}>
                            {insights.map((ins, i) => (
                                <InsightCard
                                    key={i}
                                    emoji={ins.emoji}
                                    title={ins.title}
                                    body={ins.body}
                                    accent={ins.accent}
                                />
                            ))}
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
        gap: Spacing.md,
    },
    pageTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37, marginBottom: 4 },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        padding: 20,
    },
    sectionTag: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.3,
        marginBottom: 16,
    },
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    heroVal: {
        fontSize: 38,
        fontWeight: '700',
        letterSpacing: -1.5,
        marginTop: 6,
    },
    savingsPill: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    kpiRow: {
        flexDirection: 'row',
    },
    loader: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cardShadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' } as any }),
    },
});
