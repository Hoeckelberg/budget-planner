import React, { useCallback } from 'react';
import {
    View,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Platform,
    Pressable,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { GlassTiers, Shadows, BorderRadius } from '@/constants/Colors';

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
    const tier = GlassTiers[elevation];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        if (pressable || onPress) {
            scale.value = withSpring(0.972, { damping: 18, stiffness: 300 });
        }
    }, [pressable, onPress, scale]);

    const handlePressOut = useCallback(() => {
        if (pressable || onPress) {
            scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        }
    }, [pressable, onPress, scale]);

    const glowStyle = glowColor ? Shadows.glow(glowColor) : Shadows.md;

    const baseStyle: StyleProp<ViewStyle>[] = [
        styles.card,
        {
            backgroundColor: tier.background,
            borderColor: tier.border,
            borderRadius: radius,
        },
        glowStyle,
        style ?? {},
    ];

    const content = (
        <>
            {/* Inner top-edge highlight — the "glass catches light" effect */}
            <View
                style={[
                    styles.highlight,
                    {
                        backgroundColor: tier.highlight,
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                    },
                ]}
                pointerEvents="none"
            />
            {children}
        </>
    );

    if (pressable || onPress) {
        return (
            <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Animated.View style={[baseStyle, animatedStyle]}>
                    {content}
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <View style={baseStyle}>
            {content}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden',
        ...Platform.select({
            web: {
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            } as any,
        }),
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        pointerEvents: 'none',
    },
});
