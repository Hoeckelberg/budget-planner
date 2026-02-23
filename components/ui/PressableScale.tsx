import React, { useCallback } from 'react';
import {
    Pressable,
    PressableProps,
    StyleSheet,
    Platform,
    ViewStyle,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

interface PressableScaleProps extends PressableProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /** Scale factor on press — default 0.964 */
    scaleDown?: number;
    /** Spring config */
    damping?: number;
    stiffness?: number;
    disabled?: boolean;
}

/**
 * PressableScale — unified press interaction component
 * Mobile: spring scale animation on press
 * Web: cursor pointer + subtle hover scale via CSS
 */
export function PressableScale({
    children,
    style,
    scaleDown = 0.964,
    damping = 18,
    stiffness = 300,
    disabled = false,
    onPress,
    onPressIn,
    onPressOut,
    ...rest
}: PressableScaleProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback((e: any) => {
        if (!disabled) {
            scale.value = withSpring(scaleDown, { damping, stiffness });
        }
        onPressIn?.(e);
    }, [disabled, scaleDown, damping, stiffness, scale, onPressIn]);

    const handlePressOut = useCallback((e: any) => {
        scale.value = withSpring(1, { damping, stiffness });
        onPressOut?.(e);
    }, [damping, stiffness, scale, onPressOut]);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={Platform.select({
                web: { cursor: disabled ? 'default' : 'pointer' } as any,
                default: undefined,
            })}
            {...rest}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({});
