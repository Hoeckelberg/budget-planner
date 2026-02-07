import React from 'react';
import { StyleSheet, ScrollView, View, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { Typography, Spacing, CategoryColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { DonutChart } from '@/components/DonutChart';

const MOCK_MONTHLY_DATA = [
    { month: 'Sep', income: 3200, expenses: 2100 },
    { month: 'Okt', income: 3200, expenses: 2400 },
    { month: 'Nov', income: 3450, expenses: 2200 },
    { month: 'Dez', income: 3800, expenses: 2800 },
    { month: 'Jan', income: 3200, expenses: 1900 },
    { month: 'Feb', income: 3200, expenses: 1953 },
];

const MOCK_CATEGORIES = [
    { id: '1', name: 'Miete', amount: 850, color: CategoryColors.rent },
    { id: '2', name: 'Lebensmittel', amount: 320, color: CategoryColors.groceries },
    { id: '3', name: 'Abos', amount: 89, color: CategoryColors.subscriptions },
    { id: '4', name: 'Transport', amount: 120, color: CategoryColors.transport },
    { id: '5', name: 'Essen gehen', amount: 180, color: CategoryColors.dining },
    { id: '6', name: 'Freizeit', amount: 150, color: CategoryColors.entertainment },
    { id: '7', name: 'Sonstiges', amount: 244, color: CategoryColors.other },
];

export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const maxValue = Math.max(...MOCK_MONTHLY_DATA.map(d => Math.max(d.income, d.expenses)));

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
                        Statistik
                    </Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                        Deine Finanzübersicht
                    </Text>
                </Animated.View>

                {/* Monthly Overview Chart */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        📊 Monatlicher Verlauf
                    </Text>
                    <GlassCard>
                        <View style={styles.barChart}>
                            {MOCK_MONTHLY_DATA.map((data, index) => (
                                <View key={data.month} style={styles.barGroup}>
                                    {/* Income bar */}
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                styles.incomeBar,
                                                { height: `${(data.income / maxValue) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                    {/* Expense bar */}
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.bar,
                                                styles.expenseBar,
                                                { height: `${(data.expenses / maxValue) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                    <Text style={[Typography.caption2, { color: colors.textSecondary }]}>
                                        {data.month}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>Einnahmen</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>Ausgaben</Text>
                            </View>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        🏷️ Ausgaben nach Kategorie
                    </Text>
                    <GlassCard>
                        <DonutChart
                            data={MOCK_CATEGORIES}
                            size={200}
                            strokeWidth={24}
                            centerLabel="Gesamt"
                        />
                    </GlassCard>
                </Animated.View>

                {/* Insights */}
                <Animated.View entering={FadeInDown.delay(400)}>
                    <Text style={[Typography.title3, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                        💡 Insights
                    </Text>

                    <GlassCard style={styles.insightCard}>
                        <Text style={styles.insightIcon}>📈</Text>
                        <View style={styles.insightContent}>
                            <Text style={[Typography.headline, { color: colors.text }]}>
                                Sparquote: 39%
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                Du sparst mehr als der Durchschnitt (15%)!
                            </Text>
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.insightCardWithMargin}>
                        <Text style={styles.insightIcon}>⚠️</Text>
                        <View style={styles.insightContent}>
                            <Text style={[Typography.headline, { color: colors.text }]}>
                                Essen gehen: +23%
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                Diese Kategorie ist im Vergleich zum Vormonat gestiegen.
                            </Text>
                        </View>
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
    },
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 150,
        alignItems: 'flex-end',
        marginBottom: Spacing.md,
    },
    barGroup: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    barContainer: {
        width: 16,
        height: 120,
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
    },
    incomeBar: {
        backgroundColor: '#34C759',
    },
    expenseBar: {
        backgroundColor: '#FF3B30',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
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
    insightIcon: {
        fontSize: 32,
    },
    insightContent: {
        flex: 1,
    },
});
