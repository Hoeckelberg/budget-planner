/**
 * TypeScript Database Types for Supabase
 * 
 * These types are generated based on the database schema
 * Update these when the database schema changes
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    monthly_income: number
                    currency: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    monthly_income?: number
                    currency?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    monthly_income?: number
                    currency?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    icon: string | null
                    color: string | null
                    type: 'expense' | 'income'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    icon?: string | null
                    color?: string | null
                    type?: 'expense' | 'income'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    icon?: string | null
                    color?: string | null
                    type?: 'expense' | 'income'
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string | null
                    amount: number
                    type: 'income' | 'expense'
                    description: string | null
                    transaction_date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id?: string | null
                    amount: number
                    type: 'income' | 'expense'
                    description?: string | null
                    transaction_date?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string | null
                    amount?: number
                    type?: 'income' | 'expense'
                    description?: string | null
                    transaction_date?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            savings_goals: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    icon: string
                    target_amount: number
                    current_amount: number
                    color: string
                    deadline: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    icon: string
                    target_amount: number
                    current_amount?: number
                    color: string
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    icon?: string
                    target_amount?: number
                    current_amount?: number
                    color?: string
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            budgets: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string | null
                    amount: number
                    period: 'monthly' | 'weekly' | 'yearly'
                    start_date: string
                    end_date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id?: string | null
                    amount: number
                    period: 'monthly' | 'weekly' | 'yearly'
                    start_date: string
                    end_date: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string | null
                    amount?: number
                    period?: 'monthly' | 'weekly' | 'yearly'
                    start_date?: string
                    end_date?: string
                    created_at?: string
                }
            }
            recurring_transactions: {
                Row: {
                    id: string
                    user_id: string
                    category_id: string | null
                    amount: number
                    type: 'income' | 'expense'
                    description: string | null
                    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
                    next_occurrence: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category_id?: string | null
                    amount: number
                    type: 'income' | 'expense'
                    description?: string | null
                    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
                    next_occurrence: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category_id?: string | null
                    amount?: number
                    type?: 'income' | 'expense'
                    description?: string | null
                    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
                    next_occurrence?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_monthly_summary: {
                Args: {
                    user_uuid: string
                    target_month?: string
                }
                Returns: {
                    total_income: number
                    total_expenses: number
                    net_savings: number
                    transaction_count: number
                }[]
            }
            get_category_breakdown: {
                Args: {
                    user_uuid: string
                    start_date?: string
                    end_date?: string
                }
                Returns: {
                    category_id: string
                    category_name: string
                    category_icon: string
                    category_color: string
                    total_amount: number
                    transaction_count: number
                }[]
            }
            get_monthly_stats: {
                Args: {
                    user_uuid: string
                    months_back?: number
                }
                Returns: {
                    month: string
                    income: number
                    expenses: number
                    net_savings: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
