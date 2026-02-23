import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Pressable,
    Platform,
    TextInput,
    Alert,
    Modal,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { Typography, Spacing, SemanticColors, BorderRadius } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedProgressBar } from '@/components/ProgressComponents';
import { CircularProgress } from '@/components/CircularProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useSavingsGoals } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { PressableScale } from '@/components/ui/PressableScale';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GoalModalData {
    id?: string;
    title: string;
    icon: string;
    targetAmount: string;
    currentAmount: string;
    deadline: string;
    color: string;
}

const GOAL_COLORS = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30',
    '#AF52DE', '#5AC8FA', '#FF2D55', '#5856D6',
];
const GOAL_ICONS = ['🏝️', '🛡️', '💻', '📈', '🚗', '🏠', '✈️', '🎓', '💎', '🎯'];

const DEFAULT_MODAL_DATA: GoalModalData = {
    title: '',
    icon: '🎯',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    color: '#007AFF',
};

// ─── Goal Card ────────────────────────────────────────────────────────────────
interface GoalCardProps {
    id: string;
    title: string;
    icon: string;
    current: number;
    target: number;
    color: string;
    deadline?: string;
    onEdit: (id: string) => void;
    onContribute: (id: string, current: number) => void;
    onDelete: (id: string) => void;
}

function GoalCard({ id, title, icon, current, target, color, deadline, onEdit, onContribute, onDelete }: GoalCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const progress = target > 0 ? Math.min(current / target, 1) : 0;
    const remaining = Math.max(0, target - current);
    const pct = (progress * 100).toFixed(0);
    const isComplete = progress >= 1;

    return (
        <GlassCard style={styles.goalCard} elevation="elevated">
            {/* Top row */}
            <View style={styles.goalHeader}>
                <View style={[styles.goalIconWrap, { backgroundColor: `${color}20` }]}>
                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[Typography.headline, { color: colors.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {deadline && (
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                            Ziel: {new Date(deadline).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                        </Text>
                    )}
                </View>
                <CircularProgress
                    percentage={parseFloat(pct)}
                    size={52}
                    strokeWidth={5}
                    color={isComplete ? SemanticColors.income : color}
                    backgroundColor="rgba(255,255,255,0.1)"
                />
            </View>

            {/* Amounts */}
            <View style={styles.goalAmounts}>
                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                    €{current.toLocaleString('de-DE')} von €{target.toLocaleString('de-DE')}
                </Text>
                {!isComplete && (
                    <Text style={[Typography.caption1, { color: color, fontWeight: '600' }]}>
                        noch €{remaining.toLocaleString('de-DE')}
                    </Text>
                )}
                {isComplete && (
                    <Text style={[Typography.caption1, { color: SemanticColors.income, fontWeight: '700' }]}>
                        ✓ Erreicht!
                    </Text>
                )}
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: Spacing.sm }}>
                <AnimatedProgressBar
                    progress={progress}
                    color={isComplete ? SemanticColors.income : color}
                    height={6}
                />
            </View>

            {/* Actions */}
            <View style={styles.goalActions}>
                <Pressable
                    style={[styles.actionBtn, { backgroundColor: `${color}18`, borderColor: `${color}40`, borderWidth: 1 }]}
                    onPress={() => onContribute(id, current)}
                >
                    <Text style={[Typography.caption1, { color, fontWeight: '700' }]}>+ Einzahlen</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => onEdit(id)}>
                    <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✏️</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => onDelete(id)}>
                    <Text style={{ color: SemanticColors.expense, fontSize: 16 }}>🗑️</Text>
                </Pressable>
            </View>
        </GlassCard>
    );
}

// ─── Goal Modal ───────────────────────────────────────────────────────────────
interface GoalModalProps {
    visible: boolean;
    data: GoalModalData;
    onChange: (data: Partial<GoalModalData>) => void;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    isEdit: boolean;
}

function GoalModal({ visible, data, onChange, onClose, onSave, saving, isEdit }: GoalModalProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.modalBackdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.modalSheet, { backgroundColor: '#0D1117' }]}>
                    {/* Handle */}
                    <View style={styles.modalHandle} />

                    <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.lg }]}>
                        {isEdit ? 'Ziel bearbeiten' : 'Neues Sparziel'}
                    </Text>

                    {/* Icon picker */}
                    <View style={styles.iconRow}>
                        {GOAL_ICONS.map(ic => (
                            <Pressable
                                key={ic}
                                onPress={() => onChange({ icon: ic })}
                                style={[
                                    styles.iconOption,
                                    data.icon === ic && { backgroundColor: `${data.color}30`, borderColor: data.color },
                                ]}
                            >
                                <Text style={{ fontSize: 20 }}>{ic}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Color picker */}
                    <View style={[styles.iconRow, { marginBottom: Spacing.md }]}>
                        {GOAL_COLORS.map(c => (
                            <Pressable
                                key={c}
                                onPress={() => onChange({ color: c })}
                                style={[
                                    styles.colorDot,
                                    { backgroundColor: c },
                                    data.color === c && styles.colorDotSelected,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Title */}
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]}
                        placeholder="Titel (z.B. Urlaub 2026)"
                        placeholderTextColor={colors.textSecondary}
                        value={data.title}
                        onChangeText={t => onChange({ title: t })}
                        maxLength={40}
                    />

                    {/* Target Amount */}
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]}
                        placeholder="Zielbetrag (€)"
                        placeholderTextColor={colors.textSecondary}
                        value={data.targetAmount}
                        onChangeText={t => onChange({ targetAmount: t.replace(/[^0-9.]/g, '') })}
                        keyboardType="decimal-pad"
                    />

                    {/* Current Amount */}
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]}
                        placeholder="Aktueller Betrag (€)"
                        placeholderTextColor={colors.textSecondary}
                        value={data.currentAmount}
                        onChangeText={t => onChange({ currentAmount: t.replace(/[^0-9.]/g, '') })}
                        keyboardType="decimal-pad"
                    />

                    {/* Target Date (Deadline) */}
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]}
                        placeholder="Zieldatum (JJJJ-MM-TT)"
                        placeholderTextColor={colors.textSecondary}
                        value={data.deadline}
                        onChangeText={t => onChange({ deadline: t })}
                    />

                    {/* Save/Cancel */}
                    <View style={styles.modalActions}>
                        <Pressable style={styles.cancelBtn} onPress={onClose}>
                            <Text style={[Typography.body, { color: colors.textSecondary }]}>Abbrechen</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.saveBtn, { backgroundColor: data.color, opacity: saving ? 0.6 : 1 }]}
                            onPress={onSave}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator size="small" color="#FFF" />
                                : <Text style={[Typography.headline, { color: '#FFF' }]}>
                                    {isEdit ? 'Aktualisieren' : 'Erstellen'}
                                </Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GoalsScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const { user } = useAuth();

    const { goals, loading } = useSavingsGoals(user?.id);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<GoalModalData>(DEFAULT_MODAL_DATA);
    const [saving, setSaving] = useState(false);

    const isEdit = !!modalData.id;

    const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.current_amount, 0), [goals]);
    const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.target_amount, 0), [goals]);
    const overallProgress = totalTarget > 0 ? totalSaved / totalTarget : 0;

    const openCreate = useCallback(() => {
        setModalData(DEFAULT_MODAL_DATA);
        setModalVisible(true);
    }, []);

    const openEdit = useCallback((id: string) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        setModalData({
            id: goal.id,
            title: goal.title,
            icon: goal.icon || '🎯',
            targetAmount: goal.target_amount.toString(),
            currentAmount: goal.current_amount.toString(),
            deadline: goal.deadline || '',
            color: goal.color || '#007AFF',
        });
        setModalVisible(true);
    }, [goals]);

    const handleContribute = useCallback((id: string, current: number) => {
        Alert.prompt(
            'Einzahlen',
            'Betrag eingeben (€)',
            async (input) => {
                const amount = parseFloat(input);
                if (!amount || amount <= 0) return;
                const newAmount = current + amount;
                await supabase
                    .from('savings_goals')
                    .update({ current_amount: newAmount })
                    .eq('id', id);
            },
            'plain-text',
            '',
            'decimal-pad',
        );
    }, []);

    const handleDelete = useCallback((id: string) => {
        Alert.alert('Löschen', 'Sparziel wirklich löschen?', [
            { text: 'Abbrechen', style: 'cancel' },
            {
                text: 'Löschen',
                style: 'destructive',
                onPress: async () => {
                    await supabase.from('savings_goals').delete().eq('id', id);
                },
            },
        ]);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user || !modalData.title || !modalData.targetAmount) {
            Alert.alert('Fehler', 'Bitte Titel und Zielbetrag eingeben.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                user_id: user.id,
                title: modalData.title,
                icon: modalData.icon,
                target_amount: parseFloat(modalData.targetAmount),
                current_amount: parseFloat(modalData.currentAmount) || 0,
                color: modalData.color,
                deadline: modalData.deadline || null,
            };

            if (isEdit && modalData.id) {
                const { error } = await supabase
                    .from('savings_goals')
                    .update(payload)
                    .eq('id', modalData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('savings_goals')
                    .insert(payload);
                if (error) throw error;
            }
            setModalVisible(false);
        } catch (err: any) {
            Alert.alert('Fehler', err.message || 'Speichern fehlgeschlagen.');
        } finally {
            setSaving(false);
        }
    }, [user, modalData, isEdit]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <View style={styles.titleRow}>
                        <View>
                            <Text style={[styles.pageTitle, { color: colors.text }]}>Sparziele</Text>
                            <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                                {goals.length} {goals.length === 1 ? 'Ziel' : 'Ziele'} aktiv
                            </Text>
                        </View>
                        <PressableScale onPress={openCreate}>
                            <View style={[styles.addBtn, { backgroundColor: colors.tint }]}>
                                <Text style={{ color: '#FFF', fontSize: 22, lineHeight: 26 }}>+</Text>
                            </View>
                        </PressableScale>
                    </View>
                </Animated.View>

                {/* Overall Progress */}
                {goals.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <GlassCard style={styles.totalCard} elevation="elevated" glowColor="#007AFF">
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>GESAMTFORTSCHRITT</Text>
                            <Text style={[styles.totalAmount, { color: colors.text }]}>
                                €{totalSaved.toLocaleString('de-DE')}
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
                                von €{totalTarget.toLocaleString('de-DE')} Gesamt
                            </Text>
                            <AnimatedProgressBar
                                progress={overallProgress}
                                color={SemanticColors.savings}
                                height={10}
                            />
                            <Text style={[Typography.caption1, { color: colors.tint, marginTop: Spacing.sm, fontWeight: '700' }]}>
                                {(overallProgress * 100).toFixed(0)}% erreicht
                            </Text>
                        </GlassCard>
                    </Animated.View>
                )}

                {/* Loading */}
                {loading && (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color={colors.tint} size="large" />
                    </View>
                )}

                {/* Empty state */}
                {!loading && goals.length === 0 && (
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <GlassCard style={styles.emptyCard} elevation="base">
                            <Text style={{ fontSize: 48, textAlign: 'center' }}>🎯</Text>
                            <Text style={[Typography.title3, { color: colors.text, textAlign: 'center', marginTop: 12 }]}>
                                Noch keine Ziele
                            </Text>
                            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
                                Erstelle dein erstes Sparziel und behalte deine Finanzen im Blick.
                            </Text>
                            <Pressable
                                style={[styles.emptyAddBtn, { backgroundColor: colors.tint }]}
                                onPress={openCreate}
                            >
                                <Text style={[Typography.headline, { color: '#FFF' }]}>Erstes Ziel erstellen</Text>
                            </Pressable>
                        </GlassCard>
                    </Animated.View>
                )}

                {/* Goals List */}
                {!loading && goals.map((goal, i) => (
                    <Animated.View
                        key={goal.id}
                        entering={FadeInDown.delay(150 + i * 80).springify()}
                    >
                        <GoalCard
                            id={goal.id}
                            title={goal.title}
                            icon={goal.icon || '🎯'}
                            current={goal.current_amount}
                            target={goal.target_amount}
                            color={goal.color || '#007AFF'}
                            deadline={goal.deadline || undefined}
                            onEdit={openEdit}
                            onContribute={handleContribute}
                            onDelete={handleDelete}
                        />
                    </Animated.View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Goal Modal */}
            <GoalModal
                visible={modalVisible}
                data={modalData}
                onChange={(partial) => setModalData(prev => ({ ...prev, ...partial }))}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                saving={saving}
                isEdit={isEdit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
        gap: Spacing.md,
    },
    pageTitle: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.37,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    totalAmount: {
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: -1.5,
        marginVertical: 4,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    loadingBox: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: Spacing.xl,
        gap: 0,
    },
    emptyAddBtn: {
        marginTop: Spacing.lg,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
    },

    // Goal Card
    goalCard: { paddingVertical: Spacing.md },
    goalHeader: { flexDirection: 'row', alignItems: 'center' },
    goalIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    goalActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Modal
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalSheet: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    iconRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    iconOption: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    colorDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    colorDotSelected: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        transform: [{ scale: 1.15 }],
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: 14,
        fontSize: 16,
        marginBottom: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    modalActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    cancelBtn: {
        flex: 0.4,
        padding: Spacing.md,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    saveBtn: {
        flex: 0.6,
        padding: Spacing.md,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
});
