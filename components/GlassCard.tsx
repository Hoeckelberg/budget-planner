/**
 * SoftCard — replaces GlassCard for the light fintech theme.
 * Same API, same import path. No glass blur — uses soft diffuse shadows.
 */
import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Pressable,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { CardTiers, Shadows, BorderRadius } from '@/constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────
type Elevation = 'base' | 'elevated' | 'overlay';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevation?: Elevation;
    /** Adds a colored glow shadow (pass a hex color) */
    glowColor?: string;
    /** If true, card has pressable spring feedback */
    pressable?: boolean;
    onPress?: () => void;
    /** Border radius override — defaults to lg (20) */
    radius?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GlassCard({
    children,
    style,
    elevation = 'elevated',
    glowColor,
    pressable = false,
    onPress,
    radius = BorderRadius.lg,
}: GlassCardProps) {
    const tier = CardTiers[elevation];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        if (pressable || onPress) {
            scale.value = withSpring(0.974, { damping: 20, stiffness: 320 });
        }
    }, [pressable, onPress, scale]);

    const handlePressOut = useCallback(() => {
        if (pressable || onPress) {
            scale.value = withSpring(1, { damping: 20, stiffness: 320 });
        }
    }, [pressable, onPress, scale]);

    const shadowStyle = glowColor ? Shadows.glow(glowColor) : tier.shadow;

    const baseStyle: StyleProp<ViewStyle>[] = [
        styles.card,
        {
            backgroundColor: tier.background,
            borderRadius: radius,
        },
        shadowStyle,
        style ?? {},
    ];

    const content = <>{children}</>;

    if (pressable || onPress) {
        return (
            <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Animated.View style={[baseStyle, animatedStyle]}>
                    {content}
                </Animated.View>
            </Pressable>
        );
    }

    return <View style={baseStyle}>{content}</View>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                // Web: subtle box-shadow instead of native shadow props
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            } as any,
        }),
    },
});
