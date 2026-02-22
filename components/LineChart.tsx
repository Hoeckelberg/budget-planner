import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import Colors, { Typography, SemanticColors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    height?: number;
    showGradient?: boolean;
    lineColor?: string;
    gradientColors?: [string, string];
}

/**
 * LineChart - Smooth line chart with gradient fill
 * Perfect for showing trends over time
 */
export function LineChart({
    data,
    height = 150,
    showGradient = true,
    lineColor = SemanticColors.income,
    gradientColors = [SemanticColors.income, 'transparent'],
}: LineChartProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const padding = 20;
    const chartWidth = 300;
    const chartHeight = height - padding * 2;

    // Calculate min/max for scaling
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Generate path points
    const points = useMemo(() => {
        return data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
            const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
            return { x, y, label: point.label, value: point.value };
        });
    }, [data, chartWidth, chartHeight, minValue, range]);

    // Create smooth curve path using quadratic bezier curves
    const linePath = useMemo(() => {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX = (current.x + next.x) / 2;

            path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`;
            path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`;
        }

        return path;
    }, [points]);

    // Create gradient fill path
    const gradientPath = useMemo(() => {
        if (!showGradient || points.length === 0) return '';

        let path = linePath;
        const lastPoint = points[points.length - 1];
        const firstPoint = points[0];

        // Close the path at the bottom
        path += ` L ${lastPoint.x} ${height}`;
        path += ` L ${firstPoint.x} ${height}`;
        path += ' Z';

        return path;
    }, [linePath, points, height, showGradient]);

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
                {showGradient && (
                    <Defs>
                        <SvgLinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={gradientColors[0]} stopOpacity="0.3" />
                            <Stop offset="1" stopColor={gradientColors[1]} stopOpacity="0" />
                        </SvgLinearGradient>
                    </Defs>
                )}

                {/* Gradient fill */}
                {showGradient && gradientPath && (
                    <Path d={gradientPath} fill="url(#lineGradient)" />
                )}

                {/* Line */}
                <Path
                    d={linePath}
                    stroke={lineColor}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <Circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill={lineColor}
                        stroke={colors.background}
                        strokeWidth={2}
                    />
                ))}
            </Svg>

            {/* Labels */}
            <View style={styles.labelsContainer}>
                {data.map((point, index) => (
                    <Text
                        key={index}
                        style={[
                            Typography.caption2,
                            { color: colors.textSecondary, textAlign: 'center' }
                        ]}
                    >
                        {point.label}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 8,
        paddingHorizontal: 20,
    },
});
