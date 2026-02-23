import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  StatusBar,
  Platform,
  ActivityIndicator,
  Pressable,
  ListRenderItemInfo,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Colors, { Typography, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BalanceCard, QuickStatRow, TransactionItem, SectionHeader } from '@/components/DashboardComponents';
import { DonutChart } from '@/components/DonutChart';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useMonthlySummary, useCategoryBreakdown } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DisplayTransaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
  type: 'income' | 'expense';
  categoryColor?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Heute';
  if (date.toDateString() === yesterday.toDateString()) return 'Gestern';
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

// ─── Header Component (rendered inside FlatList) ──────────────────────────────
function DashboardHeader({
  availableAmount,
  totalBudget,
  totalIncome,
  totalExpenses,
  totalExpensesDisplay,
  chartData,
}: {
  availableAmount: number;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  totalExpensesDisplay: string;
  chartData: Array<{ id: string; name: string; amount: number; color: string }>;
}) {
  return (
    <>
      {/* Balance Hero Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <BalanceCard
          availableAmount={availableAmount}
          totalBudget={totalBudget}
        />
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <QuickStatRow income={totalIncome} expenses={totalExpenses} />
      </Animated.View>

      {/* Spending Breakdown */}
      {chartData.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard style={styles.chartCard} elevation="base">
            <Text style={styles.chartTitle}>AUSGABEN NACH KATEGORIE</Text>
            <DonutChart
              data={chartData}
              size={200}
              strokeWidth={22}
              centerLabel={`€${totalExpensesDisplay}`}
              centerSubLabel="Ausgaben"
            />
          </GlassCard>
        </Animated.View>
      )}

      {/* Section Header for transactions */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <SectionHeader title="Transaktionen" action="Alle anzeigen" />
      </Animated.View>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { summary, loading: summaryLoading } = useMonthlySummary(user?.id);
  const { breakdown, loading: breakdownLoading } = useCategoryBreakdown(user?.id);

  const recentTransactions = useMemo((): DisplayTransaction[] => {
    return transactions.slice(0, 15).map(t => {
      const category = (t as any).categories;
      return {
        id: t.id,
        title: t.description || 'Transaktion',
        category: category?.name || 'Sonstiges',
        amount: t.amount,
        date: formatDate(t.transaction_date),
        icon: category?.icon || '📦',
        type: t.type as 'income' | 'expense',
        categoryColor: category?.color,
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

  const totalIncome = useMemo(() =>
    summary?.total_income ??
    transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [summary, transactions]);

  const totalExpenses = useMemo(() =>
    summary?.total_expenses ??
    transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [summary, transactions]);

  const availableAmount = totalIncome - totalExpenses;
  const totalBudget = totalIncome > 0 ? totalIncome : 1000;
  const totalExpensesDisplay = Math.round(totalExpenses).toLocaleString('de-DE');

  const handleEditTransaction = useCallback(async (id: string) => {
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
      },
    });
  }, [transactions, router]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
    }
  }, []);

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<DisplayTransaction>) => (
    <Animated.View entering={FadeInDown.delay(420 + index * 40).springify()}>
      <TransactionItem
        key={item.id}
        id={item.id}
        title={item.title}
        category={item.category}
        amount={item.amount}
        date={item.date}
        icon={item.icon}
        type={item.type}
        categoryColor={item.categoryColor}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
    </Animated.View>
  ), [handleEditTransaction, handleDeleteTransaction]);

  const keyExtractor = useCallback((item: DisplayTransaction) => item.id, []);

  const isLoading = transactionsLoading || summaryLoading || breakdownLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[Typography.subhead, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          Lade Daten…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={recentTransactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        removeClippedSubviews={Platform.OS !== 'web'}
        maxToRenderPerBatch={12}
        windowSize={5}
        initialNumToRender={8}
        ListHeaderComponent={
          <DashboardHeader
            availableAmount={availableAmount}
            totalBudget={totalBudget}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            totalExpensesDisplay={totalExpensesDisplay}
            chartData={chartData}
          />
        }
        ListHeaderComponentStyle={styles.headerWrapper}
        ListFooterComponent={
          <GlassCard style={styles.transactionsFooter} elevation="base">
            {recentTransactions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32 }}>📭</Text>
                <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                  Noch keine Transaktionen
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/add')}
                  style={styles.addFirstButton}
                >
                  <Text style={[Typography.subhead, { color: colors.tint }]}>
                    Erste Transaktion hinzufügen →
                  </Text>
                </Pressable>
              </View>
            )}
          </GlassCard>
        }
        ListFooterComponentStyle={styles.footerWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
  },
  headerWrapper: {},
  footerWrapper: { marginTop: 0 },
  chartCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  transactionsFooter: {
    padding: 0,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  addFirstButton: {
    marginTop: 12,
  },
});
