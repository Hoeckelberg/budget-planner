/**
 * BalanceTimeline — Interactive touch balance curve
 * Smooth bezier curve with gradient fill, drag-to-inspect, animated dot marker
 * All SVG touch handled via react-native-svg + Reanimated
 */
import React, { useMemo, useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Platform,
    PanResponder,
    GestureResponderEvent,
    LayoutChangeEvent,
} from 'react-native';
import Svg, {
    Path,
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
    Circle,
    Line,
    Text as SvgText,
} from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import Colors, { Typography, Spacing } from '@/constants/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TimelinePoint {
    date: string;       // 'YYYY-MM-DD'
    label: string;      // display label e.g. '14 Feb'
    balance: number;    // cumulative running balance
}

interface BalanceTimelineProps {
    data: TimelinePoint[];
    height?: number;
    positiveColor?: string;
    negativeColor?: string;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────
function buildBezierPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpx = (p0.x + p1.x) / 2;
        path += ` C ${cpx} ${p0.y} ${cpx} ${p1.y} ${p1.x} ${p1.y}`;
    }
    return path;
}

function buildFillPath(pts: { x: number; y: number }[], chartH: number, totalH: number): string {
    const line = buildBezierPath(pts);
    if (!line || pts.length === 0) return '';
    const last = pts[pts.length - 1];
    const first = pts[0];
    const bottom = totalH;
    return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BalanceTimeline({
    data,
    height = 200,
    positiveColor = '#7B61FF',
    negativeColor = '#EF4444',
}: BalanceTimelineProps) {
    const colors = Colors.light;
    const [containerWidth, setContainerWidth] = useState(340);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const PADDING_H = 20;
    const PADDING_V = 16;
    const chartW = containerWidth - PADDING_H * 2;
    const chartH = height - PADDING_V * 2;

    const minBalance = useMemo(() => Math.min(...data.map(d => d.balance), 0), [data]);
    const maxBalance = useMemo(() => Math.max(...data.map(d => d.balance), 1), [data]);
    const range = useMemo(() => (maxBalance - minBalance) || 1, [maxBalance, minBalance]);

    const pts = useMemo(() => {
        if (data.length === 0) return [];
        return data.map((d, i) => ({
            x: PADDING_H + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
            y: PADDING_V + chartH - ((d.balance - minBalance) / range) * chartH,
        }));
    }, [data, chartW, chartH, minBalance, range]);

    const lastBalance = data.length > 0 ? data[data.length - 1].balance : 0;
    const isPositive = lastBalance >= 0;
    const lineColor = isPositive ? positiveColor : negativeColor;

    const linePath = useMemo(() => buildBezierPath(pts), [pts]);
    const fillPath = useMemo(() => buildFillPath(pts, chartH, height), [pts, chartH, height]);

    // ─── Touch / Drag handling ────────────────────────────────────────────────
    const findNearestIndex = useCallback((touchX: number): number => {
        if (pts.length === 0) return 0;
        let nearest = 0;
        let minDist = Infinity;
        pts.forEach((p, i) => {
            const dist = Math.abs(p.x - touchX);
            if (dist < minDist) { minDist = dist; nearest = i; }
        });
        return nearest;
    }, [pts]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            setIsDragging(true);
            setSelectedIndex(findNearestIndex(evt.nativeEvent.locationX));
        },
        onPanResponderMove: (evt) => {
            setSelectedIndex(findNearestIndex(evt.nativeEvent.locationX));
        },
        onPanResponderRelease: () => {
            setIsDragging(false);
            setTimeout(() => setSelectedIndex(null), 1800);
        },
    }), [findNearestIndex]);

    const selectedPt = selectedIndex !== null ? pts[selectedIndex] : null;
    const selectedData = selectedIndex !== null ? data[selectedIndex] : data[data.length - 1];

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    }, []);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <View onLayout={handleLayout}>
            {/* Tooltip / current display */}
            <View style={styles.tooltipRow}>
                <View>
                    <Text style={[styles.tooltipBalance, { color: isPositive ? positiveColor : negativeColor }]}>
                        €{(selectedData?.balance ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text style={[Typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                        {selectedData?.label ?? ''}
                    </Text>
                </View>
                {isDragging && (
                    <View style={[styles.dragPill, { backgroundColor: `${lineColor}15` }]}>
                        <Text style={[Typography.caption2, { color: lineColor, fontWeight: '700' }]}>
                            Ziehen
                        </Text>
                    </View>
                )}
            </View>

            {/* Chart */}
            <View style={{ height }} {...panResponder.panHandlers}>
                <Svg width="100%" height={height} viewBox={`0 0 ${containerWidth} ${height}`}>
                    <Defs>
                        <SvgLinearGradient id="tlGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={lineColor} stopOpacity="0.20" />
                            <Stop offset="1" stopColor={lineColor} stopOpacity="0.00" />
                        </SvgLinearGradient>
                    </Defs>

                    {/* Gradient fill */}
                    {fillPath ? (
                        <Path d={fillPath} fill="url(#tlGradient)" />
                    ) : null}

                    {/* Line */}
                    {linePath ? (
                        <Path
                            d={linePath}
                            stroke={lineColor}
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}

                    {/* Crosshair indicator */}
                    {selectedPt && (
                        <>
                            <Line
                                x1={selectedPt.x}
                                y1={PADDING_V}
                                x2={selectedPt.x}
                                y2={height - PADDING_V}
                                stroke={lineColor}
                                strokeWidth={1}
                                strokeDasharray="4 3"
                                opacity={0.4}
                            />
                            {/* Outer ring */}
                            <Circle
                                cx={selectedPt.x}
                                cy={selectedPt.y}
                                r={10}
                                fill={lineColor}
                                opacity={0.12}
                            />
                            {/* Inner dot */}
                            <Circle
                                cx={selectedPt.x}
                                cy={selectedPt.y}
                                r={5}
                                fill={lineColor}
                                stroke="#FFFFFF"
                                strokeWidth={2}
                            />
                        </>
                    )}

                    {/* Last point always visible */}
                    {pts.length > 0 && !selectedPt && (
                        <>
                            <Circle
                                cx={pts[pts.length - 1].x}
                                cy={pts[pts.length - 1].y}
                                r={8}
                                fill={lineColor}
                                opacity={0.15}
                            />
                            <Circle
                                cx={pts[pts.length - 1].x}
                                cy={pts[pts.length - 1].y}
                                r={4.5}
                                fill={lineColor}
                                stroke="#FFFFFF"
                                strokeWidth={2}
                            />
                        </>
                    )}
                </Svg>
            </View>

            {/* Date axis labels */}
            {data.length > 1 && (
                <View style={styles.axisRow}>
                    <Text style={[Typography.caption2, { color: colors.textTertiary }]}>
                        {data[0]?.label}
                    </Text>
                    {data.length > 4 && (
                        <Text style={[Typography.caption2, { color: colors.textTertiary }]}>
                            {data[Math.floor(data.length / 2)]?.label}
                        </Text>
                    )}
                    <Text style={[Typography.caption2, { color: colors.textTertiary }]}>
                        {data[data.length - 1]?.label}
                    </Text>
                </View>
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    tooltipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing.sm,
        paddingHorizontal: 4,
    },
    tooltipBalance: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    dragPill: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    axisRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 6,
    },
});
