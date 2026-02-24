/**
 * InteractiveDonut — Tap-to-select donut chart with animated segments
 * Features: segment tap highlight, center data display, income/expense mode toggle,
 * animated arc draw-on, legend with percentage bars
 */
import React, { useMemo, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Platform,
} from 'react-native';
import Svg, {
    Circle,
    G,
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
} from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing, BorderRadius } from '@/constants/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DonutSegment {
    id: string;
    name: string;
    amount: number;
    color: string;
    icon?: string;
    prevAmount?: number;   // for trend delta
}

interface InteractiveDonutProps {
    data: DonutSegment[];
    size?: number;
    strokeWidth?: number;
    mode?: 'expense' | 'income';
    onModeChange?: (mode: 'expense' | 'income') => void;
    selectedId?: string | null;
    onSelect?: (id: string | null) => void;
}

// ─── Animated Segment ─────────────────────────────────────────────────────────
function DonutSegmentArc({
    cx, cy, r, circumference, startOffset, dashLen, color, strokeWidth, isSelected, anySelected,
}: {
    cx: number; cy: number; r: number; circumference: number;
    startOffset: number; dashLen: number; color: string;
    strokeWidth: number; isSelected: boolean; anySelected: boolean;
}) {
    const progress = useSharedValue(0);

    React.useEffect(() => {
        progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: -startOffset + circumference * (1 - progress.value),
        // Only dim when another segment IS selected and this one is NOT
        opacity: withTiming(anySelected && !isSelected ? 0.28 : 1, { duration: 200 }),
    }));

    return (
        <AnimatedCircle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${circumference}`}
            strokeLinecap="butt"
            animatedProps={animatedProps}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InteractiveDonut({
    data,
    size = 220,
    strokeWidth = 26,
    mode = 'expense',
    onModeChange,
    selectedId,
    onSelect,
}: InteractiveDonutProps) {
    const colors = Colors.light;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const total = useMemo(() => data.reduce((s, d) => s + d.amount, 0), [data]);

    // Build segment geometry (cumulative offsets)
    // GAP_PX: small gap between segments to prevent overlap
    const GAP_PX = 3;
    const segments = useMemo(() => {
        let acc = 0;
        return data.map(seg => {
            const pct = total > 0 ? seg.amount / total : 0;
            const fullLen = circumference * pct;
            const dashLen = Math.max(0, fullLen - GAP_PX); // inset each arc slightly
            const startOffset = acc;
            acc += fullLen; // advance by the full length (gap is visual only)
            return { ...seg, pct, dashLen, startOffset };
        });
    }, [data, total, circumference]);

    const selected = useMemo(
        () => segments.find(s => s.id === selectedId) ?? null,
        [segments, selectedId]
    );

    const handleSegmentTap = useCallback((id: string) => {
        onSelect?.(selectedId === id ? null : id);
    }, [selectedId, onSelect]);

    // ─── Center content ───────────────────────────────────────────────────────
    const centerAmount = selected?.amount ?? total;
    const centerLabel = selected?.name ?? (mode === 'expense' ? 'Ausgaben' : 'Einnahmen');
    const centerPct = selected ? (selected.pct * 100).toFixed(1) : null;
    const delta = selected && selected.prevAmount != null
        ? ((selected.amount - selected.prevAmount) / (selected.prevAmount || 1)) * 100
        : null;

    return (
        <View style={styles.wrapper}>
            {/* Mode toggle */}
            <View style={styles.modeRow}>
                {(['expense', 'income'] as const).map(m => (
                    <Pressable
                        key={m}
                        onPress={() => onModeChange?.(m)}
                        style={[styles.modeBtn, mode === m && { backgroundColor: colors.tint }]}
                    >
                        <Text style={[Typography.caption1, {
                            color: mode === m ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: '700',
                        }]}>
                            {m === 'expense' ? '↓ Ausgaben' : '↑ Einnahmen'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.chartRow}>
                {/* Donut SVG */}
                <View style={{ position: 'relative' }}>
                    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <Defs>
                            <SvgLinearGradient id="bgTrack" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#E5E7EB" stopOpacity="1" />
                                <Stop offset="1" stopColor="#F3F4F6" stopOpacity="1" />
                            </SvgLinearGradient>
                        </Defs>

                        {/* Track */}
                        <Circle
                            cx={center} cy={center} r={radius}
                            fill="none"
                            stroke="url(#bgTrack)"
                            strokeWidth={strokeWidth}
                        />

                        {/* Segments */}
                        <G rotation={-90} origin={`${center}, ${center}`}>
                            {segments.map(seg => (
                                <DonutSegmentArc
                                    key={seg.id}
                                    cx={center} cy={center} r={radius}
                                    circumference={circumference}
                                    startOffset={seg.startOffset}
                                    dashLen={seg.dashLen}
                                    color={seg.color}
                                    strokeWidth={strokeWidth}
                                    isSelected={seg.id === selectedId}
                                    anySelected={selectedId != null}
                                />
                            ))}
                        </G>
                    </Svg>

                    {/* Center label — absolute overlay */}
                    <View style={[styles.center, { width: size, height: size }]}>
                        <Text style={[styles.centerAmount, { color: selected?.color ?? colors.tint }]}>
                            €{centerAmount.toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                        </Text>
                        {centerPct && (
                            <Text style={[Typography.caption1, { color: colors.textSecondary }]}>
                                {centerPct}%
                            </Text>
                        )}
                        <Text style={[Typography.caption2, { color: colors.textTertiary, textAlign: 'center', marginTop: 2 }]}>
                            {centerLabel}
                        </Text>
                        {delta != null && (
                            <View style={[styles.deltaPill, { backgroundColor: delta >= 0 ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)' }]}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: delta >= 0 ? '#EF4444' : '#22C55E' }}>
                                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}%
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Legend (right of chart) */}
                <View style={styles.legend}>
                    {segments.slice(0, 6).map(seg => (
                        <Pressable
                            key={seg.id}
                            style={styles.legendItem}
                            onPress={() => handleSegmentTap(seg.id)}
                        >
                            <View style={[styles.legendDot, {
                                backgroundColor: seg.color,
                                opacity: selectedId && seg.id !== selectedId ? 0.4 : 1,
                            }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={[Typography.caption1, { color: colors.text, fontWeight: '600' }]} numberOfLines={1}>
                                    {seg.name}
                                </Text>
                                <Text style={[Typography.caption2, { color: colors.textSecondary }]}>
                                    €{seg.amount.toLocaleString('de-DE')}
                                </Text>
                            </View>
                            <Text style={[Typography.caption2, { color: seg.color, fontWeight: '700' }]}>
                                {(seg.pct * 100).toFixed(0)}%
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Tap-to-select hint */}
            {segments.length > 0 && (
                <Text style={[Typography.caption2, { color: colors.textTertiary, textAlign: 'center', marginTop: 8 }]}>
                    Segment antippen zum Filtern
                </Text>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: {},
    modeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: Spacing.md,
        backgroundColor: '#F2F3F7',
        borderRadius: BorderRadius.full,
        padding: 3,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    center: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        left: 0,
    },
    centerAmount: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    deltaPill: {
        marginTop: 4,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    legend: {
        flex: 1,
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        flexShrink: 0,
    },
});
