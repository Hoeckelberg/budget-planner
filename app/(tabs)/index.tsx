import React from 'react';
import { StyleSheet, ScrollView, View, Text, StatusBar, Platform } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Colors, { Typography, Spacing, CategoryColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BalanceCard, QuickStatRow, TransactionItem, SectionHeader } from '@/components/DashboardComponents';
import { DonutChart } from '@/components/DonutChart';
import { SavingsGoalCard } from '@/components/ProgressComponents';
import { GlassCard } from '@/components/GlassCard';

// Mock data - will be replaced with real data from Supabase
const MOCK_DATA = {
  availableAmount: 1247.00,
  totalBudget: 1850.00,
  income: 3200,
  expenses: 1953,
  savings: 450,

  categories: [
    { id: '1', name: 'Miete', amount: 850, color: CategoryColors.rent },
    { id: '2', name: 'Lebensmittel', amount: 320, color: CategoryColors.groceries },
    { id: '3', name: 'Abos', amount: 89, color: CategoryColors.subscriptions },
    { id: '4', name: 'Transport', amount: 120, color: CategoryColors.transport },
    { id: '5', name: 'Essen gehen', amount: 180, color: CategoryColors.dining },
    { id: '6', name: 'Freizeit', amount: 150, color: CategoryColors.entertainment },
    { id: '7', name: 'Sonstiges', amount: 244, color: CategoryColors.other },
  ],

  savingsGoals: [
    { id: '1', title: 'Urlaub 2026', icon: '🏝️', current: 450, target: 2000 },
    { id: '2', title: 'Notgroschen', icon: '🛡️', current: 2800, target: 5000 },
  ],

  recentTransactions: [
    { id: '1', title: 'REWE', category: 'Lebensmittel', amount: 47.82, date: 'Heute', icon: '🛒', type: 'expense' as const },
    { id: '2', title: 'Gehalt', category: 'Einkommen', amount: 3200, date: 'Gestern', icon: '💼', type: 'income' as const },
    { id: '3', title: 'Netflix', category: 'Abos', amount: 12.99, date: '05.02.', icon: '🎬', type: 'expense' as const },
    { id: '4', title: 'Tankstelle', category: 'Transport', amount: 65.00, date: '04.02.', icon: '⛽', type: 'expense' as const },
  ],
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.header}>
            <View>
              <Text style={[Typography.title2, { color: colors.text }]}>
                Budget Planner
              </Text>
              <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                Februar 2026
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
          </View>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <BalanceCard
            availableAmount={MOCK_DATA.availableAmount}
            totalBudget={MOCK_DATA.totalBudget}
          />
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.section}>
            <QuickStatRow
              income={MOCK_DATA.income}
              expenses={MOCK_DATA.expenses}
              savings={MOCK_DATA.savings}
            />
          </View>
        </Animated.View>

        {/* Expense Chart */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <SectionHeader title="Ausgaben nach Kategorie" action="Details" />
          <GlassCard>
            <DonutChart
              data={MOCK_DATA.categories}
              size={180}
              strokeWidth={20}
              centerLabel="Ausgaben"
            />
          </GlassCard>
        </Animated.View>

        {/* Savings Goals */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <SectionHeader title="🎯 Sparziele" action="Alle anzeigen" />
          <View style={styles.goalsContainer}>
            {MOCK_DATA.savingsGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                title={goal.title}
                icon={goal.icon}
                currentAmount={goal.current}
                targetAmount={goal.target}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <SectionHeader title="Letzte Transaktionen" action="Alle anzeigen" />
          <GlassCard style={styles.transactionsCard}>
            {MOCK_DATA.recentTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.title}
                category={transaction.category}
                amount={transaction.amount}
                date={transaction.date}
                icon={transaction.icon}
                type={transaction.type}
              />
            ))}
          </GlassCard>
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: Spacing.md,
  },
  goalsContainer: {
    gap: Spacing.sm,
  },
  transactionsCard: {
    paddingVertical: Spacing.xs,
  },
});
