/**
 * useRecurring — Recurring transactions hook
 * Auto-processes due recurring transactions on app load.
 *
 * Required Supabase table:
 * CREATE TABLE recurring_transactions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *   category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
 *   amount DECIMAL(12,2) NOT NULL,
 *   type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
 *   description TEXT,
 *   frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly')),
 *   next_due_date DATE NOT NULL,
 *   last_run_date DATE,
 *   is_active BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users manage own recurring" ON recurring_transactions FOR ALL USING (auth.uid() = user_id);
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface RecurringTransaction {
    id: string;
    categoryId: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextOccurrence: string;
    isActive: boolean;
}

export interface CreateRecurringInput {
    userId: string;
    categoryId: string;
    amount: number;
    type: 'income' | 'expense';
    description?: string;
    frequency: 'monthly' | 'weekly';
    startDate?: string; // defaults to today
}

/** Returns next occurrence date string based on frequency */
function advanceDueDate(current: string, frequency: string): string {
    const d = new Date(current);
    if (frequency === 'monthly') {
        d.setMonth(d.getMonth() + 1);
    } else {
        d.setDate(d.getDate() + 7);
    }
    return d.toISOString().split('T')[0];
}

export function useRecurring(userId: string | undefined) {
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processed, setProcessed] = useState(false);

    const fetchRecurring = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        try {
            const { data, error } = await supabase
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('next_occurrence', { ascending: true });

            if (error) throw error;

            setRecurring((data || []).map((r: any) => ({
                id: r.id,
                categoryId: r.category_id,
                amount: r.amount,
                type: r.type,
                description: r.description,
                frequency: r.frequency,
                nextOccurrence: r.next_occurrence,
                isActive: r.is_active,
            })));
        } catch (err) {
            console.warn('[useRecurring] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /** Process all due recurring transactions — called once on mount */
    const processDueTransactions = useCallback(async () => {
        if (!userId || processed) return;
        setProcessed(true);

        try {
            const today = new Date().toISOString().split('T')[0];

            const { data: due, error } = await supabase
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .lte('next_occurrence', today);

            if (error || !due?.length) return;

            const inserts = due.map((r: any) => ({
                user_id: userId,
                category_id: r.category_id,
                amount: r.amount,
                type: r.type,
                description: r.description || 'Wiederkehrend',
                transaction_date: today,
            }));

            // Insert all due transactions in one batch
            const { error: insertError } = await supabase
                .from('transactions')
                .insert(inserts);

            if (insertError) throw insertError;

            // Advance next_due_date for each processed recurring
            for (const r of (due as any[])) {
                const nextDate = advanceDueDate(r.next_occurrence, r.frequency);
                await supabase
                    .from('recurring_transactions')
                    .update({ next_occurrence: nextDate })
                    .eq('id', r.id);
            }

            // Refresh after processing
            await fetchRecurring();
        } catch (err) {
            console.warn('[useRecurring] process error:', err);
        }
    }, [userId, processed, fetchRecurring]);

    useEffect(() => {
        fetchRecurring();
    }, [fetchRecurring]);

    useEffect(() => {
        if (!loading && !processed) {
            processDueTransactions();
        }
    }, [loading, processed, processDueTransactions]);

    const createRecurring = useCallback(async (input: CreateRecurringInput) => {
        const startDate = input.startDate ?? new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('recurring_transactions').insert({
            user_id: input.userId,
            category_id: input.categoryId,
            amount: input.amount,
            type: input.type,
            description: input.description || '',
            frequency: input.frequency,
            next_occurrence: startDate,
            is_active: true,
        });
        if (!error) fetchRecurring();
        return error;
    }, [fetchRecurring]);

    const deactivate = useCallback(async (id: string) => {
        await supabase.from('recurring_transactions').update({ is_active: false }).eq('id', id);
        fetchRecurring();
    }, [fetchRecurring]);

    return { recurring, loading, createRecurring, deactivate, refresh: fetchRecurring };
}
