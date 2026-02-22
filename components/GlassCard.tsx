import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    Platform
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import Colors, { BorderRadius, Shadows } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: 'low' | 'medium' | 'high';
    animated?: boolean;
    glowColor?: string;
}

/**
 * GlassCard - Glassmorphism card component with Apple-style design
 * Features backdrop blur effect and subtle border highlights
 */
export function GlassCard({
    children,
    style,
    intensity = 'medium',
    animated = false,
    glowColor,
}: GlassCardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value) }],
        };
    });

    const intensityStyles = {
        low: { opacity: 0.3, blur: 15 },    // More transparent
        medium: { opacity: 0.5, blur: 25 }, // Standard VisionOS glass
        high: { opacity: 0.7, blur: 40 },   // Heavy material
    };

    const glowStyle = glowColor ? Shadows.glow(glowColor) : {};

    const cardStyles = [
        styles.card,
        {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
        },
        glowStyle,
        style,
    ];

    if (animated) {
        return (
            <Animated.View style={[cardStyles, animatedStyle]}>
                {/* Inner highlight for glass effect */}
                <View style={[styles.highlight, { opacity: intensityStyles[intensity].opacity * 0.1 }]} />
                {children}
            </Animated.View>
        );
    }

    return (
        <View style={cardStyles}>
            <View style={[styles.highlight, { opacity: intensityStyles[intensity].opacity * 0.1 }]} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden',
        // Backdrop blur for web
        ...Platform.select({
            web: {
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            } as any,
        }),
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        backgroundColor: 'rgba(255,255,255,0.1)',
        pointerEvents: 'none',
    },
});
