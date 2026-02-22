import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import Colors, { CategoryColors, Typography, Spacing, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { GlassCard } from './GlassCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ExpenseCategory {
    id: string;
    name: string;
    amount: number;
    color: string;
    icon?: string;
}

interface DonutChartProps {
    data: ExpenseCategory[];
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
    centerSubLabel?: string;
    centerValue?: string;
}

/**
 * DonutChart - Interactive animated donut chart for expense visualization
 * Features smooth entry animations and center label display
 */
export function DonutChart({
    data,
    size = 200,
    strokeWidth = 24,
    centerLabel = 'Gesamt',
    centerSubLabel,
    centerValue,
}: DonutChartProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const animationProgress = useSharedValue(0);

    React.useEffect(() => {
        animationProgress.value = withTiming(1, { duration: 1000 });
    }, []);

    // Calculate segment positions
    let accumulatedPercent = 0;
    const segments = data.map((item) => {
        const percent = item.amount / total;
        const startAngle = accumulatedPercent * 360 - 90;
        accumulatedPercent += percent;

        return {
            ...item,
            percent,
            startAngle,
            dashArray: circumference * percent,
            dashOffset: circumference * (1 - percent),
        };
    });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={colors.glassBorder}
                    strokeWidth={strokeWidth}
                />

                {/* Data segments */}
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {segments.map((segment, index) => {
                        const previousSegments = segments.slice(0, index);
                        const offset = previousSegments.reduce(
                            (acc, seg) => acc + circumference * seg.percent,
                            0
                        );

                        return (
                            <Circle
                                key={segment.id}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${segment.dashArray} ${circumference}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </G>
            </Svg>

            {/* Center content */}
            <View style={[styles.centerContent, { width: size, height: size }]}>
                <Text style={[Typography.title1, { color: colors.text, marginBottom: 4 }]}>
                    {centerValue || `€${total.toLocaleString('de-DE')}`}
                </Text>
                {centerSubLabel && (
                    <Text style={[Typography.caption1, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
                        {centerSubLabel}
                    </Text>
                )}
                {!centerSubLabel && centerLabel && (
                    <Text style={[Typography.footnote, { color: colors.textSecondary }]}>
                        {centerLabel}
                    </Text>
                )}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {segments.map((segment) => (
                    <View key={segment.id} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                        <Text style={[Typography.caption1, { color: colors.textSecondary, flex: 1 }]}>
                            {segment.name}
                        </Text>
                        <Text style={[Typography.caption1, { color: colors.text }]}>
                            {(segment.percent * 100).toFixed(0)}%
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    centerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    legend: {
        marginTop: Spacing.lg,
        width: '100%',
        gap: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
