import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Platform,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius, CategoryColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';

const CATEGORIES = [
    { id: 'groceries', name: 'Einkauf', icon: '🛒', color: CategoryColors.groceries },
    { id: 'dining', name: 'Essen', icon: '🍽️', color: CategoryColors.dining },
    { id: 'transport', name: 'Transport', icon: '🚗', color: CategoryColors.transport },
    { id: 'entertainment', name: 'Freizeit', icon: '🎮', color: CategoryColors.entertainment },
    { id: 'subscriptions', name: 'Abos', icon: '📱', color: CategoryColors.subscriptions },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: CategoryColors.shopping },
    { id: 'health', name: 'Gesundheit', icon: '💊', color: CategoryColors.health },
    { id: 'other', name: 'Sonstiges', icon: '📦', color: CategoryColors.other },
];

export default function AddTransactionScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');

    const buttonScale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleNumberPress = (num: string) => {
        if (num === '.' && amount.includes('.')) return;
        if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
        setAmount(prev => prev + num);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleSave = () => {
        buttonScale.value = withSpring(0.95, {}, () => {
            buttonScale.value = withSpring(1);
        });
        // TODO: Save transaction to Supabase
        console.log('Save transaction:', { amount, category: selectedCategory, type: transactionType });
    };

    const formatAmount = (value: string) => {
        if (!value) return '0,00';
        const num = parseFloat(value);
        return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                        Neue Transaktion
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

                {/* Amount Display */}
                <Animated.View entering={FadeInDown.delay(300)}>
                    <GlassCard style={styles.amountCard}>
                        <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>€</Text>
                        <Text style={[styles.amountText, {
                            color: transactionType === 'expense' ? '#FF3B30' : '#34C759'
                        }]}>
                            {formatAmount(amount)}
                        </Text>
                    </GlassCard>
                </Animated.View>

                {/* Category Selection */}
                <Animated.View entering={FadeInDown.delay(400)}>
                    <Text style={[Typography.headline, { color: colors.text, marginBottom: Spacing.md }]}>
                        Kategorie
                    </Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((category) => (
                            <Pressable
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    {
                                        backgroundColor: selectedCategory === category.id
                                            ? `${category.color}30`
                                            : colors.glass,
                                        borderColor: selectedCategory === category.id
                                            ? category.color
                                            : colors.glassBorder,
                                    },
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text style={[Typography.caption1, {
                                    color: selectedCategory === category.id ? category.color : colors.text
                                }]}>
                                    {category.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* Numpad */}
                <Animated.View entering={FadeInDown.delay(500)} style={styles.numpad}>
                    {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', '⌫']].map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.numpadRow}>
                            {row.map((num) => (
                                <Pressable
                                    key={num}
                                    style={[styles.numpadButton, { backgroundColor: colors.glass }]}
                                    onPress={() => num === '⌫' ? handleDelete() : handleNumberPress(num)}
                                >
                                    <Text style={[styles.numpadText, { color: colors.text }]}>{num}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ))}
                </Animated.View>

                {/* Save Button */}
                <Animated.View entering={FadeInDown.delay(600)} style={animatedButtonStyle}>
                    <Pressable
                        style={[styles.saveButton, {
                            opacity: amount && selectedCategory ? 1 : 0.5
                        }]}
                        onPress={handleSave}
                        disabled={!amount || !selectedCategory}
                    >
                        <Text style={[Typography.headline, { color: '#FFFFFF' }]}>
                            💾 Speichern
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
    amountText: {
        fontSize: 48,
        fontWeight: '700',
        letterSpacing: -1,
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
