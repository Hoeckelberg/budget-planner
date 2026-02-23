/**
 * useBudgets — Category budget limits hook
 * Fetches budgets from `category_budgets` table joined with actual category spend
 *
 * Required Supabase table (run in SQL editor):
 * CREATE TABLE category_budgets (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *   category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
 *   monthly_limit DECIMAL(12,2) NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(user_id, category_id)
 * );
 * ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users manage own budgets" ON category_budgets FOR ALL USING (auth.uid() = user_id);
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface BudgetWithSpend {
    id: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    limit: number;
    spent: number;
    remaining: number;
    progress: number; // 0–1
    isOverspent: boolean;
}

export interface CategoryBudgetInput {
    categoryId: string;
    monthlyLimit: number;
}

export function useBudgets(userId: string | undefined) {
    const [budgets, setBudgets] = useState<BudgetWithSpend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBudgets = useCallback(async () => {
        if (!userId) { setLoading(false); return; }

        try {
            // Get the current month range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            // Fetch budgets with joined category info
            const { data: budgetRows, error: budgetErr } = await supabase
                .from('category_budgets')
                .select(`
                    id,
                    monthly_limit,
                    category_id,
                    categories (id, name, icon, color)
                `)
                .eq('user_id', userId);

            if (budgetErr) throw budgetErr;

            // Fetch actual spend this month per category
            const { data: transactions, error: txErr } = await supabase
                .from('transactions')
                .select('category_id, amount')
                .eq('user_id', userId)
                .eq('type', 'expense')
                .gte('transaction_date', startOfMonth)
                .lte('transaction_date', endOfMonth);

            if (txErr) throw txErr;

            // Aggregate spend per category
            const spendMap: Record<string, number> = {};
            for (const tx of (transactions || [])) {
                spendMap[tx.category_id] = (spendMap[tx.category_id] || 0) + tx.amount;
            }

            const result: BudgetWithSpend[] = (budgetRows || []).map((row: any) => {
                const cat = row.categories;
                const spent = spendMap[row.category_id] || 0;
                const limit = row.monthly_limit;
                return {
                    id: row.id,
                    categoryId: row.category_id,
                    categoryName: cat?.name || 'Unbekannt',
                    categoryIcon: cat?.icon || '📦',
                    categoryColor: cat?.color || '#8E8E93',
                    limit,
                    spent,
                    remaining: Math.max(0, limit - spent),
                    progress: limit > 0 ? Math.min(spent / limit, 1) : 0,
                    isOverspent: spent > limit,
                };
            });

            setBudgets(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchBudgets();

        if (!userId) return;
        const channel = supabase
            .channel('budgets_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'category_budgets', filter: `user_id=eq.${userId}` }, fetchBudgets)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, fetchBudgets)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId, fetchBudgets]);

    const createBudget = useCallback(async (input: CategoryBudgetInput) => {
        if (!userId) return;
        await supabase.from('category_budgets').upsert({
            user_id: userId,
            category_id: input.categoryId,
            monthly_limit: input.monthlyLimit,
        }, { onConflict: 'user_id,category_id' });
        fetchBudgets();
    }, [userId, fetchBudgets]);

    const deleteBudget = useCallback(async (id: string) => {
        await supabase.from('category_budgets').delete().eq('id', id);
        fetchBudgets();
    }, [fetchBudgets]);

    return { budgets, loading, error, createBudget, deleteBudget, refresh: fetchBudgets };
}
