/**
 * Supabase Client Configuration
 * 
 * Setup:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Copy your project URL and anon key
 * 3. Create a .env file in the root directory with:
 *    EXPO_PUBLIC_SUPABASE_URL=your_project_url
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials not found. Please create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
}

// Platform-specific storage adapter
const storage = Platform.OS === 'web' ? {
    getItem: async (key: string) => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
    },
} : AsyncStorage;

// Create a dummy client if credentials are missing (for development without backend)
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: storage as any,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    })
    : null as any; // Fallback for missing credentials

// Helper function to get current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Helper function to sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
