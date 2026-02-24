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
import Colors, { Typography, Spacing, BorderRadius, Shadows, SemanticColors } from '@/constants/Colors';
import { BalanceCard, QuickStatRow, TransactionItem, SectionHeader, KPICard } from '@/components/DashboardComponents';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, useMonthlySummary } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Heute';
  if (date.toDateString() === yesterday.toDateString()) return 'Gestern';
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const { user } = useAuth();

  const { transactions, loading: txLoading } = useTransactions(user?.id);
  const { summary, loading: summaryLoading } = useMonthlySummary(user?.id);

  const allTransactions = useMemo((): DisplayTransaction[] =>
    transactions.map(t => {
      const cat = (t as any).categories;
      return {
        id: t.id,
        title: t.description || 'Transaktion',
        category: cat?.name || 'Sonstiges',
        amount: t.amount,
        date: formatDate(t.transaction_date),
        icon: cat?.icon || '📦',
        type: t.type as 'income' | 'expense',
        categoryColor: cat?.color,
      };
    }), [transactions]);

  const totalIncome = useMemo(() =>
    summary?.total_income ?? transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [summary, transactions]);

  const totalExpenses = useMemo(() =>
    summary?.total_expenses ?? transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [summary, transactions]);

  const availableAmount = totalIncome - totalExpenses;
  const totalBudget = totalIncome > 0 ? totalIncome : 1;
  const savingsRate = totalIncome > 0 ? ((availableAmount / totalIncome) * 100) : 0;

  const handleEdit = useCallback(async (id: string) => {
    const t = transactions.find(tx => tx.id === id);
    if (!t) return;
    router.push({ pathname: '/(tabs)/add', params: { id: t.id, amount: t.amount.toString(), type: t.type, categoryId: t.category_id, description: t.description || '' } });
  }, [transactions, router]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<DisplayTransaction>) => (
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
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ), [handleEdit, handleDelete]);

  const keyExtractor = useCallback((item: DisplayTransaction) => item.id, []);

  const isLoading = txLoading || summaryLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[Typography.subhead, { color: colors.textSecondary, marginTop: 12 }]}>Lade…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── FIXED STATS HEADER ─────────────────────────────────── */}
      <View style={styles.statsHeader}>
        {/* Hero balance */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <BalanceCard availableAmount={availableAmount} totalBudget={totalBudget} />
        </Animated.View>

        {/* Income / Expense row */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <QuickStatRow income={totalIncome} expenses={totalExpenses} />
        </Animated.View>

        {/* KPI mini row */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <View style={styles.kpiRow}>
            <KPICard
              label="Sparquote"
              value={`${savingsRate.toFixed(0)}%`}
              subLabel={savingsRate >= 15 ? '🎯 Ziel erreicht' : 'Ziel: 15%'}
              accentColor={savingsRate >= 15 ? SemanticColors.income : '#F59E0B'}
              icon="💰"
            />
            <View style={{ width: 12 }} />
            <KPICard
              label="Balance"
              value={`€${Math.abs(availableAmount).toLocaleString('de-DE')}`}
              subLabel={availableAmount >= 0 ? 'im Plus' : 'im Minus'}
              accentColor={availableAmount >= 0 ? '#7B61FF' : SemanticColors.expense}
              icon="📊"
            />
          </View>
        </Animated.View>
      </View>

      {/* ── TRANSACTION SECTION — scrolls independently ──────── */}
      <Animated.View style={styles.txSection} entering={FadeInDown.delay(240).springify()}>
        {/* Section header (sticky above the list) */}
        <View style={styles.txHeader}>
          <SectionHeader
            title="Transaktionen"
            action="Alle"
            onActionPress={() => router.push('/(tabs)/stats')}
          />
        </View>

        {/* The list — fills remaining space and scrolls */}
        <View style={styles.txListCard}>
          {allTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 36 }}>📭</Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 10 }]}>
                Noch keine Transaktionen
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/add')} style={styles.emptyBtn}>
                <Text style={[Typography.subhead, { color: colors.tint, fontWeight: '600' }]}>
                  Jetzt hinzufügen →
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={allTransactions}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={Platform.OS !== 'web'}
              maxToRenderPerBatch={15}
              windowSize={5}
              initialNumToRender={10}
              style={styles.txList}
              ListFooterComponent={<View style={{ height: 8 }} />}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Fixed stats area at top
  statsHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
    paddingBottom: 4,
    gap: 12,
  },
  kpiRow: { flexDirection: 'row' },

  // Transaction section — fills remaining screen
  txSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
  },
  txHeader: {
    // SectionHeader already has marginTop/marginBottom built-in
  },
  txListCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' } as any }),
  },
  txList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 4,
  },
  emptyBtn: { marginTop: 10 },
});
