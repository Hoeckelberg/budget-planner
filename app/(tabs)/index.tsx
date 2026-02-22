import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text, StatusBar, Platform, ActivityIndicator, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { Typography, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BalanceCard, QuickStatRow, TransactionItem } from '@/components/DashboardComponents';
import { DonutChart } from '@/components/DonutChart';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useMonthlySummary, useCategoryBreakdown } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  // Fetch data from Supabase
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { summary, loading: summaryLoading } = useMonthlySummary(user?.id);
  const { breakdown, loading: breakdownLoading } = useCategoryBreakdown(user?.id);

  // Calculate derived data
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 10).map(t => { // Show more transactions for scroll
      // Access joined category data
      const category = (t as any).categories;

      return {
        id: t.id,
        title: t.description || 'Transaktion',
        category: category?.name || 'Sonstiges',
        amount: t.amount,
        date: formatDate(t.transaction_date),
        icon: category?.icon || '📦',
        type: t.type,
      };
    });
  }, [transactions]);

  const chartData = useMemo(() => {
    return breakdown.map(b => ({
      id: b.category_id,
      name: b.category_name,
      amount: b.total_amount,
      color: b.category_color,
    }));
  }, [breakdown]);

  // Calculate totals with fallback to transactions if summary is empty
  const totalIncome = summary?.total_income ||
    transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = summary?.total_expenses ||
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

  // Calculate available amount
  const availableAmount = totalIncome - totalExpenses;
  const totalBudget = totalIncome > 0 ? totalIncome : 1000; // Fallback to 1000€ if no income

  const isLoading = transactionsLoading || summaryLoading || breakdownLoading;

  // Handle transaction edit
  const handleEditTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    router.push({
      pathname: '/(tabs)/add',
      params: {
        id: transaction.id,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.category_id,
        description: transaction.description || '',
      }
    });
  };

  // Handle transaction delete
  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('Transaction deleted:', id);
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          Lade Daten...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card (Top Hero - No Header above) */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <BalanceCard
            availableAmount={availableAmount}
            totalBudget={totalBudget}
          />
        </Animated.View>

        {/* Quick Stats (Income/Expenses) */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <QuickStatRow
            income={totalIncome}
            expenses={totalExpenses}
          />
        </Animated.View>

        {/* Central Graph (Spending Breakdown) */}
        {chartData.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard style={styles.chartCard}>
              <DonutChart
                data={chartData}
                size={220}
                strokeWidth={25}
                centerLabel={`€${totalExpenses.toFixed(0)}`}
                centerSubLabel="Ausgaben"
              />
            </GlassCard>
          </Animated.View>
        )}

        {/* Transaction History Section */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ paddingBottom: 100 }}>
          <View style={styles.sectionHeader}>
            <Text style={[Typography.headline, { color: colors.text }]}>Letzte Transaktionen</Text>
            <Pressable onPress={() => router.push('/(tabs)/stats')}>
              <Text style={[Typography.subhead, { color: colors.tint }]}>Alle anzeigen</Text>
            </Pressable>
          </View>

          <GlassCard style={styles.transactionsCard}>
            {recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={transaction.id}
                title={transaction.title}
                category={transaction.category}
                amount={transaction.amount}
                date={transaction.date}
                icon={transaction.icon}
                type={transaction.type}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            ))}
            {recentTransactions.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>Keine Transaktionen</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Heute';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Gestern';
  } else {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  chartCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12
  },
  transactionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
});
