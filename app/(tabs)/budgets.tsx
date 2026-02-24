/**
 * Budgets Screen — Category budget limits management
 * Premium fintech feel: animated progress bars, overspend alerts,
 * bottom-sheet modal to set/edit limits per category
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius, Shadows, SemanticColors } from '@/constants/Colors';
import { GlassCard } from '@/components/GlassCard';
import { CategoryBudgetCard } from '@/components/CategoryBudgetCard';
import { useBudgets } from '@/hooks/data/useBudgets';
import { useCategories } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── Mini Category Picker Row ─────────────────────────────────────────────────
function CategoryPickerItem({
    cat,
    isSelected,
    hasBudget,
    onPress,
}: {
    cat: { id: string; name: string; icon: string; color: string };
    isSelected: boolean;
    hasBudget: boolean;
    onPress: () => void;
}) {
    const colors = Colors.light;
    return (
        <Pressable
            onPress={onPress}
            style={[
                catStyles.item,
                isSelected && { backgroundColor: `${cat.color}18`, borderColor: cat.color, borderWidth: 1.5 },
            ]}
        >
            <View style={[catStyles.bubble, { backgroundColor: `${cat.color}18` }]}>
                <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
            </View>
            <Text style={[Typography.caption1, { color: colors.text, fontWeight: isSelected ? '700' : '500', flex: 1 }]} numberOfLines={1}>
                {cat.name}
            </Text>
            {hasBudget && (
                <View style={catStyles.budgetDot}>
                    <Text style={catStyles.budgetDotText}>✓</Text>
                </View>
            )}
        </Pressable>
    );
}

const catStyles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderRadius: BorderRadius.md,
        marginBottom: 4,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    bubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    budgetDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: SemanticColors.income,
        alignItems: 'center',
        justifyContent: 'center',
    },
    budgetDotText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

// ─── Set Budget Modal ─────────────────────────────────────────────────────────
function SetBudgetModal({
    visible,
    categories,
    budgetIds,
    onSave,
    onClose,
}: {
    visible: boolean;
    categories: Array<{ id: string; name: string; icon: string; color: string }>;
    budgetIds: Set<string>;
    onSave: (categoryId: string, limit: number) => void;
    onClose: () => void;
}) {
    const colors = Colors.light;
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [limitText, setLimitText] = useState('');
    const [saving, setSaving] = useState(false);

    const selectedCat = useMemo(
        () => categories.find(c => c.id === selectedCatId) ?? null,
        [categories, selectedCatId]
    );

    const handleSave = useCallback(async () => {
        if (!selectedCatId) return;
        const val = parseFloat(limitText.replace(',', '.'));
        if (!val || val <= 0) return;
        setSaving(true);
        await onSave(selectedCatId, val);
        setSaving(false);
        setSelectedCatId(null);
        setLimitText('');
        onClose();
    }, [selectedCatId, limitText, onSave, onClose]);

    const handleClose = useCallback(() => {
        setSelectedCatId(null);
        setLimitText('');
        onClose();
    }, [onClose]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
                    {/* Handle */}
                    <View style={modalStyles.handle} />

                    {/* Header */}
                    <View style={modalStyles.header}>
                        <Text style={[Typography.title2, { color: colors.text }]}>Budget setzen</Text>
                        <Pressable onPress={handleClose} style={modalStyles.closeBtn}>
                            <Text style={[Typography.body, { color: colors.textSecondary }]}>Abbrechen</Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.md }}>
                        {/* Category picker */}
                        <Text style={[Typography.footnote, { color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1, fontWeight: '700' }]}>
                            KATEGORIE
                        </Text>
                        <View style={[modalStyles.catList, { backgroundColor: '#FFFFFF' }]}>
                            {categories.map(cat => (
                                <CategoryPickerItem
                                    key={cat.id}
                                    cat={cat}
                                    isSelected={cat.id === selectedCatId}
                                    hasBudget={budgetIds.has(cat.id)}
                                    onPress={() => setSelectedCatId(cat.id)}
                                />
                            ))}
                        </View>

                        {/* Limit input */}
                        {selectedCat && (
                            <Animated.View entering={FadeInDown.springify()} style={modalStyles.inputSection}>
                                <Text style={[Typography.footnote, { color: colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 1, fontWeight: '700' }]}>
                                    MONATLICHES LIMIT FÜR {selectedCat.name.toUpperCase()}
                                </Text>
                                <View style={[modalStyles.inputRow, { backgroundColor: '#FFFFFF' }]}>
                                    <Text style={[modalStyles.euro, { color: selectedCat.color }]}>€</Text>
                                    <TextInput
                                        style={[modalStyles.input, { color: colors.text }]}
                                        value={limitText}
                                        onChangeText={setLimitText}
                                        keyboardType="decimal-pad"
                                        placeholder="0"
                                        placeholderTextColor={colors.textTertiary}
                                        autoFocus
                                        selectTextOnFocus
                                    />
                                </View>

                                {/* Quick amounts */}
                                <View style={modalStyles.quickRow}>
                                    {[100, 200, 300, 500, 1000].map(amt => (
                                        <Pressable
                                            key={amt}
                                            style={[modalStyles.quickChip, limitText === String(amt) && { backgroundColor: selectedCat.color }]}
                                            onPress={() => setLimitText(String(amt))}
                                        >
                                            <Text style={[Typography.caption2, {
                                                color: limitText === String(amt) ? '#FFFFFF' : colors.textSecondary,
                                                fontWeight: '700',
                                            }]}>
                                                €{amt}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </Animated.View>
                        )}
                    </ScrollView>

                    {/* Save button */}
                    <View style={[modalStyles.footer, { backgroundColor: colors.background }]}>
                        <Pressable
                            onPress={handleSave}
                            disabled={!selectedCatId || !limitText || saving}
                            style={[
                                modalStyles.saveBtn,
                                { backgroundColor: selectedCat?.color ?? colors.tint },
                                (!selectedCatId || !limitText) && { opacity: 0.4 },
                            ]}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={modalStyles.saveBtnText}>
                                    Budget speichern
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12 },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center', marginBottom: 16,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.md, marginBottom: Spacing.md,
    },
    closeBtn: { paddingVertical: 6, paddingHorizontal: 4 },
    catList: { borderRadius: BorderRadius.lg, padding: 8, marginBottom: Spacing.lg },
    inputSection: { marginBottom: Spacing.lg },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: BorderRadius.lg, padding: 16,
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } as any }),
    },
    euro: { fontSize: 28, fontWeight: '700' },
    input: { fontSize: 36, fontWeight: '700', flex: 1, letterSpacing: -1 },
    quickRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md, flexWrap: 'wrap' },
    quickChip: {
        backgroundColor: '#F2F3F7', borderRadius: BorderRadius.full,
        paddingHorizontal: 14, paddingVertical: 7,
    },
    footer: {
        padding: Spacing.md,
        paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
        borderTopWidth: 0.5, borderTopColor: '#E5E7EB',
    },
    saveBtn: {
        borderRadius: BorderRadius.full, paddingVertical: 16,
        alignItems: 'center',
    },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

// ─── Summary Header ───────────────────────────────────────────────────────────
function BudgetSummary({
    budgets,
}: {
    budgets: Array<{ limit: number; spent: number; isOverspent: boolean }>;
}) {
    const colors = Colors.light;
    const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overCount = budgets.filter(b => b.isOverspent).length;
    const overallProgress = totalLimit > 0 ? Math.min(totalSpent / totalLimit, 1) : 0;
    const barColor = overCount > 0 ? SemanticColors.expense : overallProgress > 0.8 ? '#F59E0B' : colors.tint;

    return (
        <View style={[summaryStyles.card, summaryStyles.shadow]}>
            <View style={summaryStyles.row}>
                <View>
                    <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '700', letterSpacing: 1 }]}>GESAMT BUDGET</Text>
                    <Text style={[summaryStyles.totalVal, { color: colors.text }]}>
                        €{totalSpent.toLocaleString('de-DE')}
                        <Text style={{ fontSize: 18, color: colors.textSecondary, fontWeight: '400' }}>
                            {' '}/ €{totalLimit.toLocaleString('de-DE')}
                        </Text>
                    </Text>
                </View>
                {overCount > 0 && (
                    <View style={summaryStyles.alertPill}>
                        <Text style={summaryStyles.alertText}>⚠️ {overCount} überzogen</Text>
                    </View>
                )}
            </View>

            {/* Overall progress bar */}
            <View style={summaryStyles.track}>
                <Animated.View
                    style={[summaryStyles.fill, { width: `${overallProgress * 100}%` as any, backgroundColor: barColor }]}
                />
            </View>

            <Text style={[Typography.caption2, { color: colors.textSecondary, marginTop: 6 }]}>
                €{Math.max(0, totalLimit - totalSpent).toLocaleString('de-DE')} noch verfügbar diesen Monat
            </Text>
        </View>
    );
}

const summaryStyles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: BorderRadius.xl, padding: 20 },
    shadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' } as any }),
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
    totalVal: { fontSize: 28, fontWeight: '700', letterSpacing: -1, marginTop: 6 },
    alertPill: {
        backgroundColor: 'rgba(239,68,68,0.10)', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
    },
    alertText: { color: SemanticColors.expense, fontSize: 12, fontWeight: '700' },
    track: { height: 6, backgroundColor: '#F2F3F7', borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BudgetsScreen() {
    const colors = Colors.light;
    const { user } = useAuth();
    const { budgets, loading, createBudget, deleteBudget } = useBudgets(user?.id);
    const { categories } = useCategories();
    const [modalVisible, setModalVisible] = useState(false);

    const budgetCategoryIds = useMemo(
        () => new Set(budgets.map(b => b.categoryId)),
        [budgets]
    );

    const handleSave = useCallback(async (categoryId: string, limit: number) => {
        await createBudget({ categoryId, monthlyLimit: limit });
    }, [createBudget]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>Budgets</Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
                        Monatliche Limits pro Kategorie
                    </Text>
                </Animated.View>

                {/* Summary card */}
                {budgets.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(90).springify()}>
                        <BudgetSummary budgets={budgets} />
                    </Animated.View>
                )}

                {/* Budget cards */}
                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator color={colors.tint} size="large" />
                    </View>
                ) : budgets.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(130).springify()} style={styles.emptyState}>
                        <Text style={{ fontSize: 56, marginBottom: 16 }}>🎯</Text>
                        <Text style={[Typography.title3, { color: colors.text, textAlign: 'center' }]}>
                            Noch keine Budgets
                        </Text>
                        <Text style={[Typography.subhead, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 }]}>
                            Setze monatliche Limits für deine Ausgaben-Kategorien, um den Überblick zu behalten.
                        </Text>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.delay(130).springify()}>
                        <View style={[styles.cardContainer, styles.cardShadow]}>
                            {budgets.map((budget, index) => (
                                <View key={budget.id}>
                                    <Pressable
                                        onLongPress={() => deleteBudget(budget.id)}
                                        delayLongPress={600}
                                    >
                                        <CategoryBudgetCard budget={budget} delay={index * 80} />
                                    </Pressable>
                                    {index < budgets.length - 1 && (
                                        <View style={styles.divider} />
                                    )}
                                </View>
                            ))}
                        </View>
                        <Text style={[Typography.caption2, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm }]}>
                            Gedrückt halten zum Löschen eines Budgets
                        </Text>
                    </Animated.View>
                )}

                {/* Tips section */}
                {budgets.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(220).springify()}>
                        <View style={[styles.tipCard, styles.cardShadow]}>
                            <Text style={{ fontSize: 24, marginBottom: 8 }}>💡</Text>
                            <Text style={[Typography.headline, { color: colors.text }]}>Tipp</Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 4, lineHeight: 18 }]}>
                                Die 50/30/20-Regel empfiehlt: 50% für Notwendiges, 30% für Freizeit und 20% zum Sparen.
                            </Text>
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* FAB — Add Budget */}
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.fabContainer}>
                <Pressable
                    style={[styles.fab, { backgroundColor: colors.tint }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.fabText}>+ Budget setzen</Text>
                </Pressable>
            </Animated.View>

            {/* Set Budget Modal */}
            <SetBudgetModal
                visible={modalVisible}
                categories={categories as any}
                budgetIds={budgetCategoryIds}
                onSave={handleSave}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
        gap: Spacing.md,
    },
    pageTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
    loader: { height: 200, alignItems: 'center', justifyContent: 'center' },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    cardShadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' } as any }),
    },
    divider: { height: 0.5, backgroundColor: '#E5E7EB', marginVertical: 4 },
    tipCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.xl,
        padding: 20,
        alignItems: 'flex-start',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 100,
        left: Spacing.md,
        right: Spacing.md,
    },
    fab: {
        borderRadius: BorderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
        ...Shadows.lg,
        ...Platform.select({ web: { boxShadow: '0 8px 24px rgba(123,97,255,0.30)' } as any }),
    },
    fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
