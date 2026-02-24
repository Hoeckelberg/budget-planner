import React, { useState, useMemo, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Platform,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useCategories } from '@/hooks/useSupabase';
import { useLocalSearchParams } from 'expo-router';


export default function AddTransactionScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const { user } = useAuth();
    const router = useRouter();

    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    // Load categories from database
    const { categories: allCategories, loading: categoriesLoading } = useCategories();

    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('0');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Re-initialize form whenever we navigate to a different transaction (id changes)
    useEffect(() => {
        if (isEditMode) {
            setTransactionType((params.type as 'expense' | 'income') || 'expense');
            setAmount(params.amount ? String(params.amount) : '0');
            setSelectedCategory(params.categoryId as string);
            setDescription(params.description as string || '');
        } else {
            // Reset to blank when opening for a new transaction
            setTransactionType('expense');
            setAmount('0');
            setSelectedCategory(null);
            setDescription('');
        }
    }, [params.id]); // params.id is the discriminator — changes per transaction


    const buttonScale = useSharedValue(1);

    // Filter categories based on transaction type
    const filteredCategories = useMemo(() => {
        return allCategories?.filter(cat => cat.type === transactionType) || [];
    }, [allCategories, transactionType]);

    // Reset selected category when switching type
    useEffect(() => {
        setSelectedCategory(null);
    }, [transactionType]);

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: buttonScale.value }],
        };
    });

    const handleSave = async () => {
        if (!user || !selectedCategory || !amount || amount === '0') return;

        buttonScale.value = withSpring(0.95, {}, () => {
            buttonScale.value = withSpring(1);
        });

        setSaving(true);
        try {
            const numericAmount = parseFloat(amount);

            // Find selected category details
            const category = filteredCategories.find(c => c.id === selectedCategory);

            if (isEditMode) {
                // UPDATE existing transaction
                const { error } = await supabase
                    .from('transactions')
                    .update({
                        category_id: selectedCategory,
                        amount: numericAmount,
                        type: transactionType,
                        description: description || category?.name || 'Transaktion',
                        // Don't update date for now, keep original
                    })
                    .eq('id', params.id);

                if (error) throw error;
            } else {
                // INSERT new transaction
                const { error } = await supabase
                    .from('transactions')
                    .insert({
                        user_id: user.id,
                        category_id: selectedCategory,
                        amount: numericAmount,
                        type: transactionType,
                        description: description || category?.name || 'Transaktion',
                        transaction_date: new Date().toISOString().split('T')[0],
                    });

                if (error) throw error;
            }



            // Reset form
            setAmount('0');
            setSelectedCategory(null);
            setDescription('');

            Alert.alert(
                'Erfolg!',
                isEditMode ? 'Transaktion wurde aktualisiert' : 'Transaktion wurde gespeichert',
                [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
            );
        } catch (error: any) {
            console.error('Error saving transaction:', error);
            Alert.alert('Fehler', error.message || 'Transaktion konnte nicht gespeichert werden');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <Text style={[Typography.largeTitle, { color: colors.text, textAlign: 'center' }]}>
                        {isEditMode ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
                    </Text>
                </Animated.View>

                {/* Transaction Type Toggle */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.typeToggle}>
                    <Pressable
                        style={[
                            styles.typeButton,
                            { backgroundColor: transactionType === 'expense' ? colors.glass : 'transparent' },
                        ]}
                        onPress={() => setTransactionType('expense')}
                    >
                        <Text style={[
                            Typography.headline,
                            { color: transactionType === 'expense' ? '#FF3B30' : colors.textSecondary }
                        ]}>
                            Ausgabe
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.typeButton,
                            { backgroundColor: transactionType === 'income' ? colors.glass : 'transparent' },
                        ]}
                        onPress={() => setTransactionType('income')}
                    >
                        <Text style={[
                            Typography.headline,
                            { color: transactionType === 'income' ? '#34C759' : colors.textSecondary }
                        ]}>
                            Einnahme
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* Amount Input */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <GlassCard style={styles.amountCard}>
                        <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>€</Text>
                        <TextInput
                            style={[styles.amountInput, {
                                color: transactionType === 'expense' ? '#FF3B30' : '#34C759'
                            }]}
                            value={amount}
                            onChangeText={(text) => {
                                // Allow only numbers and one decimal point
                                const cleaned = text.replace(/[^0-9.]/g, '');
                                const parts = cleaned.split('.');
                                if (parts.length > 2) return; // Only one decimal point
                                setAmount(cleaned);
                            }}
                            keyboardType="decimal-pad"
                            placeholder="0,00"
                            placeholderTextColor={colors.textSecondary}
                            selectTextOnFocus
                            autoFocus={Platform.OS === 'web'}
                        />
                    </GlassCard>

                    {/* Description Field */}
                    <GlassCard style={styles.descriptionCard}>
                        <TextInput
                            style={[styles.descriptionInput, { color: colors.text }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Beschreibung"
                            placeholderTextColor={colors.textSecondary}
                            maxLength={100}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Category Selection */}
                <Animated.View entering={FadeInDown.delay(400)}>
                    <Text style={[Typography.headline, { color: colors.text, marginBottom: Spacing.md }]}>
                        Kategorie {transactionType === 'income' ? '(Einnahme)' : '(Ausgabe)'}
                    </Text>
                    {categoriesLoading ? (
                        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                            Lade Kategorien...
                        </Text>
                    ) : (
                        <View style={styles.categoryGrid}>
                            {filteredCategories.map((category) => (
                                <Pressable
                                    key={category.id}
                                    style={[
                                        styles.categoryButton,
                                        {
                                            backgroundColor: selectedCategory === category.id
                                                ? `${category.color || '#8E8E93'}30`
                                                : colors.glass,
                                            borderColor: selectedCategory === category.id
                                                ? (category.color || '#8E8E93')
                                                : colors.glassBorder,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Text style={styles.categoryIcon}>{category.icon || '📦'}</Text>
                                    <Text style={[Typography.caption1, {
                                        color: selectedCategory === category.id ? (category.color || '#8E8E93') : colors.text
                                    }]}>
                                        {category.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </Animated.View>

                {/* Save Button */}
                <Animated.View entering={FadeInDown.delay(600)} style={animatedButtonStyle}>
                    <Pressable
                        style={[styles.saveButton, {
                            opacity: (amount && amount !== '0' && selectedCategory && !saving) ? 1 : 0.5
                        }]}
                        onPress={handleSave}
                        disabled={!amount || amount === '0' || !selectedCategory || saving}
                    >
                        <Text style={[Typography.headline, { color: '#FFFFFF' }]}>
                            {saving ? '⏳ Speichert...' : (isEditMode ? '💾 Aktualisieren' : '💾 Speichern')}
                        </Text>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 60 : Spacing.xl,
        gap: Spacing.lg,
    },
    typeToggle: {
        flexDirection: 'row',
        gap: Spacing.sm,
        justifyContent: 'center',
    },
    typeButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
    },
    amountCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '300',
    },
    amountInput: {
        fontSize: 48,
        fontWeight: '700',
        letterSpacing: -1,
        minWidth: 200,
        textAlign: 'center',
    },
    descriptionCard: {
        marginTop: Spacing.sm,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    descriptionInput: {
        fontSize: 17,
        textAlign: 'center',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryButton: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    categoryIcon: {
        fontSize: 24,
    },
    numpad: {
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    numpadRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        justifyContent: 'center',
    },
    numpadButton: {
        width: 72,
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numpadText: {
        fontSize: 24,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
});
