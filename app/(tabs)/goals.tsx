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
import Colors, { Typography, Spacing, SemanticColors, BorderRadius, Shadows } from '@/constants/Colors';
import { AnimatedProgressBar } from '@/components/ProgressComponents';
import { CircularProgress } from '@/components/CircularProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useSavingsGoals } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { PressableScale } from '@/components/ui/PressableScale';

// ─── Contribute Modal ─────────────────────────────────────────────────────────
function ContributeModal({ visible, goalTitle, goalColor, currentAmount, onConfirm, onClose }: {
    visible: boolean;
    goalTitle: string;
    goalColor: string;
    currentAmount: number;
    onConfirm: (amount: number) => void;
    onClose: () => void;
}) {
    const colors = Colors.light;
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);

    const handleConfirm = useCallback(async () => {
        const val = parseFloat(text.replace(',', '.'));
        if (!val || val <= 0) return;
        setSaving(true);
        await onConfirm(val);
        setSaving(false);
        setText('');
        onClose();
    }, [text, onConfirm, onClose]);

    const handleClose = useCallback(() => { setText(''); onClose(); }, [onClose]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={cStyles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
                <View style={cStyles.sheet}>
                    <View style={cStyles.handle} />
                    <Text style={[Typography.title3, { color: colors.text, marginBottom: 4 }]}>Einzahlen</Text>
                    <Text style={[Typography.subhead, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>{goalTitle}</Text>

                    <View style={[cStyles.inputRow, { borderColor: `${goalColor}40` }]}>
                        <Text style={[cStyles.euro, { color: goalColor }]}>€</Text>
                        <TextInput
                            style={[cStyles.input, { color: colors.text }]}
                            value={text}
                            onChangeText={setText}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={colors.textTertiary}
                            autoFocus
                            selectTextOnFocus
                        />
                    </View>

                    <View style={cStyles.chips}>
                        {[10, 25, 50, 100, 200].map(a => (
                            <Pressable
                                key={a}
                                onPress={() => setText(String(a))}
                                style={[cStyles.chip, text === String(a) && { backgroundColor: goalColor }]}
                            >
                                <Text style={[Typography.caption2, { color: text === String(a) ? '#FFF' : colors.textSecondary, fontWeight: '700' }]}>
                                    +€{a}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        onPress={handleConfirm}
                        disabled={!text || saving}
                        style={[cStyles.confirmBtn, { backgroundColor: goalColor, opacity: (!text || saving) ? 0.4 : 1 }]}
                    >
                        {saving
                            ? <ActivityIndicator color="#FFF" />
                            : <Text style={cStyles.confirmText}>Einzahlen bestätigen</Text>
                        }
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const cStyles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
    sheet: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
    },
    handle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2,
        borderRadius: BorderRadius.lg, padding: 16, marginBottom: Spacing.md, backgroundColor: '#F8F9FB',
    },
    euro: { fontSize: 28, fontWeight: '700' },
    input: { fontSize: 36, fontWeight: '700', flex: 1, letterSpacing: -1 },
    chips: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg, flexWrap: 'wrap' },
    chip: { backgroundColor: '#F2F3F7', borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 7 },
    confirmBtn: { borderRadius: BorderRadius.full, paddingVertical: 16, alignItems: 'center' },
    confirmText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});


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

const GOAL_COLORS = ['#7B61FF', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#F472B6', '#FB923C', '#34D399'];
const GOAL_ICONS = ['🏝️', '🛡️', '💻', '📈', '🚗', '🏠', '✈️', '🎓', '💎', '🎯'];
const DEFAULT: GoalModalData = { title: '', icon: '🎯', targetAmount: '', currentAmount: '0', deadline: '', color: '#7B61FF' };

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ id, title, icon, current, target, color, deadline, onEdit, onContribute, onDelete }: {
    id: string; title: string; icon: string; current: number; target: number; color: string;
    deadline?: string; onEdit: (id: string) => void;
    onContribute: (id: string, current: number) => void; onDelete: (id: string) => void;
}) {
    const colors = Colors.light;
    const progress = target > 0 ? Math.min(current / target, 1) : 0;
    const remaining = Math.max(0, target - current);
    const isComplete = progress >= 1;

    return (
        <View style={[goalStyles.card, goalStyles.shadow]}>
            {/* Header row */}
            <View style={goalStyles.header}>
                <View style={[goalStyles.iconWrap, { backgroundColor: `${color}15` }]}>
                    <Text style={{ fontSize: 26 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[Typography.headline, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                    {deadline && (
                        <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                            Ziel: {new Date(deadline).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                        </Text>
                    )}
                </View>
                <CircularProgress
                    percentage={progress * 100}
                    size={54}
                    strokeWidth={5}
                    color={isComplete ? SemanticColors.income : color}
                    backgroundColor="rgba(0,0,0,0.06)"
                />
            </View>

            {/* Amounts */}
            <View style={goalStyles.amounts}>
                <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                    €{current.toLocaleString('de-DE')} von €{target.toLocaleString('de-DE')}
                </Text>
                <Text style={[Typography.caption1, { color: isComplete ? SemanticColors.income : color, fontWeight: '600' }]}>
                    {isComplete ? '✓ Erreicht!' : `noch €${remaining.toLocaleString('de-DE')}`}
                </Text>
            </View>

            {/* Progress bar */}
            <View style={{ marginTop: Spacing.sm }}>
                <AnimatedProgressBar progress={progress} color={isComplete ? SemanticColors.income : color} height={6} />
            </View>

            {/* Actions */}
            <View style={goalStyles.actions}>
                <Pressable
                    style={[goalStyles.contributeBtn, { backgroundColor: `${color}12`, borderColor: `${color}30`, borderWidth: 1 }]}
                    onPress={() => onContribute(id, current)}
                >
                    <Text style={[Typography.caption1, { color, fontWeight: '700' }]}>+ Einzahlen</Text>
                </Pressable>
                <Pressable style={goalStyles.iconBtn} onPress={() => onEdit(id)}>
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                </Pressable>
                <Pressable style={goalStyles.iconBtn} onPress={() => onDelete(id)}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                </Pressable>
            </View>
        </View>
    );
}

const goalStyles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', borderRadius: BorderRadius.xl, padding: 20 },
    shadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' } as any }),
    },
    header: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    amounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, alignItems: 'center' },
    contributeBtn: { flex: 1, paddingVertical: 9, borderRadius: BorderRadius.sm, alignItems: 'center' },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});

// ─── Goal Modal ───────────────────────────────────────────────────────────────
function GoalModal({ visible, data, onChange, onClose, onSave, saving, isEdit }: {
    visible: boolean; data: GoalModalData;
    onChange: (d: Partial<GoalModalData>) => void;
    onClose: () => void; onSave: () => void; saving: boolean; isEdit: boolean;
}) {
    const colors = Colors.light;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={modalStyles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={modalStyles.sheet}>
                    <View style={modalStyles.handle} />
                    <Text style={[Typography.title3, { color: colors.text, marginBottom: Spacing.lg }]}>
                        {isEdit ? 'Ziel bearbeiten' : 'Neues Sparziel'}
                    </Text>

                    {/* Icon picker */}
                    <View style={modalStyles.row}>
                        {GOAL_ICONS.map(ic => (
                            <Pressable
                                key={ic}
                                onPress={() => onChange({ icon: ic })}
                                style={[modalStyles.iconOption, data.icon === ic && { backgroundColor: `${data.color}20`, borderColor: data.color }]}
                            >
                                <Text style={{ fontSize: 20 }}>{ic}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Color picker */}
                    <View style={[modalStyles.row, { marginBottom: Spacing.md }]}>
                        {GOAL_COLORS.map(c => (
                            <Pressable
                                key={c}
                                onPress={() => onChange({ color: c })}
                                style={[modalStyles.colorDot, { backgroundColor: c }, data.color === c && modalStyles.colorDotSelected]}
                            />
                        ))}
                    </View>

                    {[
                        { placeholder: 'Titel (z.B. Urlaub 2026)', value: data.title, onChange: (t: string) => onChange({ title: t }), kbd: undefined },
                        { placeholder: 'Zielbetrag (€)', value: data.targetAmount, onChange: (t: string) => onChange({ targetAmount: t.replace(/[^0-9.]/g, '') }), kbd: 'decimal-pad' as const },
                        { placeholder: 'Aktueller Betrag (€)', value: data.currentAmount, onChange: (t: string) => onChange({ currentAmount: t.replace(/[^0-9.]/g, '') }), kbd: 'decimal-pad' as const },
                        { placeholder: 'Zieldatum (JJJJ-MM-TT)', value: data.deadline, onChange: (t: string) => onChange({ deadline: t }), kbd: undefined },
                    ].map((field, i) => (
                        <TextInput
                            key={i}
                            style={[modalStyles.input, { color: colors.text, borderColor: colors.separator }]}
                            placeholder={field.placeholder}
                            placeholderTextColor={colors.textTertiary}
                            value={field.value}
                            onChangeText={field.onChange}
                            keyboardType={field.kbd}
                        />
                    ))}

                    <View style={modalStyles.actions}>
                        <Pressable style={modalStyles.cancelBtn} onPress={onClose}>
                            <Text style={[Typography.body, { color: colors.textSecondary }]}>Abbrechen</Text>
                        </Pressable>
                        <Pressable
                            style={[modalStyles.saveBtn, { backgroundColor: data.color, opacity: saving ? 0.6 : 1 }]}
                            onPress={onSave} disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator size="small" color="#FFF" />
                                : <Text style={[Typography.headline, { color: '#FFF' }]}>{isEdit ? 'Aktualisieren' : 'Erstellen'}</Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
    },
    handle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
    iconOption: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', backgroundColor: '#F6F7FB' },
    colorDot: { width: 28, height: 28, borderRadius: 14 },
    colorDotSelected: { borderWidth: 3, borderColor: '#1C1C1E', transform: [{ scale: 1.15 }] },
    input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: 14, fontSize: 16, marginBottom: Spacing.sm, backgroundColor: '#F6F7FB' },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    cancelBtn: { flex: 0.4, padding: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.md, backgroundColor: '#F6F7FB' },
    saveBtn: { flex: 0.6, padding: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.md },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GoalsScreen() {
    const colors = Colors.light;
    const { user } = useAuth();
    const { goals, loading, refresh } = useSavingsGoals(user?.id);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<GoalModalData>(DEFAULT);
    const [saving, setSaving] = useState(false);
    const [contributeTarget, setContributeTarget] = useState<{ id: string; title: string; color: string; current: number } | null>(null);
    const isEdit = !!modalData.id;

    const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.current_amount, 0), [goals]);
    const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.target_amount, 0), [goals]);
    const overallProgress = totalTarget > 0 ? totalSaved / totalTarget : 0;

    const openCreate = useCallback(() => { setModalData(DEFAULT); setModalVisible(true); }, []);
    const openEdit = useCallback((id: string) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        setModalData({ id: goal.id, title: goal.title, icon: goal.icon || '🎯', targetAmount: goal.target_amount.toString(), currentAmount: goal.current_amount.toString(), deadline: goal.deadline || '', color: goal.color || '#7B61FF' });
        setModalVisible(true);
    }, [goals]);

    const handleContribute = useCallback((id: string, current: number) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        setContributeTarget({ id, title: goal.title, color: goal.color || '#7B61FF', current });
    }, [goals]);

    const handleContributeConfirm = useCallback(async (amount: number) => {
        if (!contributeTarget) return;
        const { error } = await supabase.from('savings_goals')
            .update({ current_amount: contributeTarget.current + amount })
            .eq('id', contributeTarget.id);
        if (error) {
            Alert.alert('Fehler', error.message);
            return;
        }
        // Manually refetch in case realtime subscription hasn't fired
        await refresh();
        // Don't self-close here — let the ContributeModal.handleConfirm call onClose()
    }, [contributeTarget, refresh]);

    const handleDelete = useCallback((id: string) => {
        Alert.alert('Löschen', 'Sparziel wirklich löschen?', [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Löschen', style: 'destructive', onPress: () => supabase.from('savings_goals').delete().eq('id', id) },
        ]);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user || !modalData.title || !modalData.targetAmount) {
            Alert.alert('Fehler', 'Bitte Titel und Zielbetrag eingeben.'); return;
        }
        setSaving(true);
        try {
            const payload = {
                user_id: user.id, title: modalData.title, icon: modalData.icon,
                target_amount: parseFloat(modalData.targetAmount),
                current_amount: parseFloat(modalData.currentAmount) || 0,
                color: modalData.color, deadline: modalData.deadline || null,
            };
            if (isEdit && modalData.id) {
                const { error } = await supabase.from('savings_goals').update(payload).eq('id', modalData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('savings_goals').insert(payload);
                if (error) throw error;
            }
            setModalVisible(false);
        } catch (err: any) {
            Alert.alert('Fehler', err.message);
        } finally {
            setSaving(false);
        }
    }, [user, modalData, isEdit]);

    return (
        <View style={[screenStyles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={screenStyles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <View style={screenStyles.titleRow}>
                        <View>
                            <Text style={[screenStyles.pageTitle, { color: colors.text }]}>Sparziele</Text>
                            <Text style={[Typography.subhead, { color: colors.textSecondary }]}>
                                {goals.length} {goals.length === 1 ? 'Ziel' : 'Ziele'} aktiv
                            </Text>
                        </View>
                        <PressableScale onPress={openCreate}>
                            <View style={[screenStyles.addBtn, { backgroundColor: colors.tint }]}>
                                <Text style={{ color: '#FFF', fontSize: 24, lineHeight: 28 }}>+</Text>
                            </View>
                        </PressableScale>
                    </View>
                </Animated.View>

                {/* Overall progress */}
                {goals.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(100).springify()}>
                        <View style={[screenStyles.overallCard, screenStyles.cardShadow]}>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, fontWeight: '700', letterSpacing: 1 }]}>
                                GESAMTFORTSCHRITT
                            </Text>
                            <Text style={[screenStyles.overallAmount, { color: colors.tint }]}>
                                €{totalSaved.toLocaleString('de-DE')}
                            </Text>
                            <Text style={[Typography.caption1, { color: colors.textSecondary, marginBottom: 12 }]}>
                                von €{totalTarget.toLocaleString('de-DE')} Gesamt
                            </Text>
                            <AnimatedProgressBar progress={overallProgress} color={colors.tint} height={10} />
                            <Text style={[Typography.caption1, { color: colors.tint, marginTop: 8, fontWeight: '700' }]}>
                                {(overallProgress * 100).toFixed(0)}% erreicht
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {loading && (
                    <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={colors.tint} size="large" />
                    </View>
                )}

                {!loading && goals.length === 0 && (
                    <Animated.View entering={FadeInDown.delay(180).springify()}>
                        <View style={[screenStyles.emptyCard, screenStyles.cardShadow]}>
                            <Text style={{ fontSize: 52, textAlign: 'center' }}>🎯</Text>
                            <Text style={[Typography.title3, { color: colors.text, textAlign: 'center', marginTop: 14 }]}>
                                Noch keine Ziele
                            </Text>
                            <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
                                Erstelle dein erstes Sparziel und behalte deine Finanzen im Blick.
                            </Text>
                            <Pressable style={[screenStyles.emptyBtn, { backgroundColor: colors.tint }]} onPress={openCreate}>
                                <Text style={[Typography.headline, { color: '#FFF' }]}>Erstes Ziel erstellen</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                )}

                {!loading && goals.map((goal, i) => (
                    <Animated.View key={goal.id} entering={FadeInDown.delay(140 + i * 70).springify()}>
                        <GoalCard
                            id={goal.id}
                            title={goal.title}
                            icon={goal.icon || '🎯'}
                            current={goal.current_amount}
                            target={goal.target_amount}
                            color={goal.color || '#7B61FF'}
                            deadline={goal.deadline || undefined}
                            onEdit={openEdit}
                            onContribute={handleContribute}
                            onDelete={handleDelete}
                        />
                    </Animated.View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>

            <GoalModal
                visible={modalVisible}
                data={modalData}
                onChange={(p) => setModalData(prev => ({ ...prev, ...p }))}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
                saving={saving}
                isEdit={isEdit}
            />

            <ContributeModal
                visible={contributeTarget != null}
                goalTitle={contributeTarget?.title ?? ''}
                goalColor={contributeTarget?.color ?? '#7B61FF'}
                currentAmount={contributeTarget?.current ?? 0}
                onConfirm={handleContributeConfirm}
                onClose={() => setContributeTarget(null)}
            />
        </View>
    );
}

const screenStyles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'ios' ? 56 : Spacing.xl,
        gap: Spacing.md,
    },
    pageTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    overallCard: { backgroundColor: '#FFFFFF', borderRadius: BorderRadius.xl, padding: 24, alignItems: 'center' },
    overallAmount: { fontSize: 42, fontWeight: '700', letterSpacing: -1.5, marginVertical: 4 },
    emptyCard: {
        backgroundColor: '#FFFFFF', borderRadius: BorderRadius.xl, padding: 36, alignItems: 'center',
    },
    emptyBtn: { marginTop: Spacing.lg, paddingVertical: 12, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.full },
    cardShadow: {
        ...Shadows.md,
        ...Platform.select({ web: { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' } as any }),
    },
});
