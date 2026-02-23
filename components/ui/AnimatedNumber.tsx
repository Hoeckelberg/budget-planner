import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { TextStyle, StyleProp } from 'react-native';

// We need AnimatedTextInput workaround for RN animated text
import { TextInput } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    style?: StyleProp<TextStyle>;
    locale?: string;
}

/**
 * AnimatedNumber — smooth numeric counter with worklet-safe animation
 * Uses AnimatedTextInput trick for native thread performance
 */
export function AnimatedNumber({
    value,
    prefix = '',
    suffix = '',
    decimals = 2,
    duration = 600,
    style,
    locale = 'de-DE',
}: AnimatedNumberProps) {
    const animatedValue = useSharedValue(0);

    useEffect(() => {
        animatedValue.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value, duration, animatedValue]);

    const animatedProps = useAnimatedProps(() => {
        const formatted = animatedValue.value.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
        return {
            text: `${prefix}${formatted}${suffix}`,
            defaultValue: `${prefix}${value.toFixed(decimals)}${suffix}`,
        } as any;
    });

    return (
        <AnimatedTextInput
            animatedProps={animatedProps}
            editable={false}
            style={[
                {
                    color: '#FFFFFF',
                    padding: 0,
                    margin: 0,
                    // Prevent text input appearance
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                },
                style,
            ]}
            // Prevent cursor / selection on web
            caretHidden
            selectTextOnFocus={false}
        />
    );
}
