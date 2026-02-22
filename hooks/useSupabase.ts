/**
 * Custom Hooks for Supabase Database Operations
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];

// Hook to fetch user's transactions
export function useTransactions(userId: string | undefined) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchTransactions = async () => {
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select(`
                        *,
                        categories (
                            id,
                            name,
                            icon,
                            color
                        )
                    `)
                    .eq('user_id', userId)
                    .order('transaction_date', { ascending: false })
                    .limit(50);

                if (error) throw error;
                setTransactions(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('transactions_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { transactions, loading, error };
}

// Hook to fetch global categories (shared by all users)
export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (error) throw error;
                setCategories(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

// Hook to fetch user's savings goals
export function useSavingsGoals(userId: string | undefined) {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchGoals = async () => {
            try {
                const { data, error } = await supabase
                    .from('savings_goals')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setGoals(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('goals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'savings_goals',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchGoals();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { goals, loading, error };
}

// Hook to get monthly summary
export function useMonthlySummary(userId: string | undefined, month?: Date) {
    const [summary, setSummary] = useState<{
        total_income: number;
        total_expenses: number;
        net_savings: number;
        transaction_count: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchSummary = async () => {
            try {
                // Format month as 'YYYY-MM' for SQL function
                const currentMonth = month || new Date();
                const targetMonth = currentMonth.toISOString().slice(0, 7); // '2026-02'

                const { data, error } = await supabase.rpc('get_monthly_summary', {
                    user_uuid: userId,
                    target_month: targetMonth,
                } as any);

                if (error) throw error;
                setSummary(data?.[0] || null);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [userId, month]);

    return { summary, loading, error };
}

// Hook to get category breakdown
export function useCategoryBreakdown(
    userId: string | undefined,
    startDate?: Date,
    endDate?: Date
) {
    const [breakdown, setBreakdown] = useState<
        Array<{
            category_id: string;
            category_name: string;
            category_icon: string;
            category_color: string;
            total_amount: number;
            transaction_count: number;
        }>
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchBreakdown = async () => {
            try {
                const { data, error } = await supabase.rpc('get_category_breakdown', {
                    user_uuid: userId,
                    ...(startDate && { start_date: startDate.toISOString().split('T')[0] }),
                    ...(endDate && { end_date: endDate.toISOString().split('T')[0] }),
                } as any);

                if (error) throw error;
                setBreakdown(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchBreakdown();
    }, [userId, startDate, endDate]);

    return { breakdown, loading, error };
}

// Hook to get monthly statistics
export function useMonthlyStats(userId: string | undefined, monthsBack: number = 6) {
    const [stats, setStats] = useState<Array<{
        month: string;
        income: number;
        expenses: number;
        net_savings: number;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const { data, error } = await supabase.rpc('get_monthly_stats', {
                    user_uuid: userId,
                    months_back: monthsBack,
                } as any);

                if (error) throw error;
                setStats(data || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId, monthsBack]);

    return { stats, loading, error };
}
