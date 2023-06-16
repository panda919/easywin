import React, { useState, Children, forwardRef, useImperativeHandle, isValidElement } from 'react'
import { Animated, Easing, Image, ImageBackground, PanResponder, StyleSheet, View } from 'react-native'
import { weighted_random } from '../../Utils/functions'
import _ from 'lodash';
import RouletteItem from './RouletteItem';
import { wp } from '../../Helper/ResponsiveScreen';

const Roulette = (props, ref) => {

    const [radius, setRadius] = useState(props?.radius || wp(75))
    const [distance, setDistance] = useState(props?.distance || wp(27.5))
    const [rouletteRotate, setRouletteRotate] = useState(props?.rouletteRotate || 0)
    const [enableUserRotate, setEnableUserRotate] = useState(props?.enableUserRotate || false)
    const [background, setBackground] = useState(props?.background || null)
    const [turns, setTurns] = useState(props?.turns || 4)
    const [duration, setDuration] = useState(props?.duration || 3500)
    const [markerTop, setMarkerTop] = useState(props?.markerTop || 0)
    const [markerWidth, setMarkerWidth] = useState(props?.markerWidth || 20)
    const [centerWidth, setCenterWidth] = useState(props?.centerWidth || 20)
    const [centerTop, setCenterTop] = useState(props?.centerTop || 0)
    const [centerImage, setCenterImage] = useState(props?.centerImage || null)
    const [markerStyle, setMarkerStyle] = useState(props?.markerStyle || {})
    const [animatedValue, setAnimatedValue] = useState(new Animated.Value(0))
    const [activeItem, setActiveItem] = useState(0)

    const step = props?.step || (2 * Math.PI) / props?.options.length;

    const panResponder = PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderRelease: () => {
            if (enableUserRotate) {
                // triggerSpin()
            }
        },
    });

    useImperativeHandle(ref, () => ({
        triggerSpin: (spinToIndex) => triggerSpin(spinToIndex)
    }))

    const triggerSpin = async (spinToIndex) => {
        const {
            options,
            onRotate,
            onRotateChange,
            prizeSlots,
        } = props;
        const randomSelected = weighted_random(
            _.map(prizeSlots, slot => parseFloat(slot.percent) * 100),
        );
        const selectedIndex = spinToIndex != null ? spinToIndex : randomSelected;
        const turnsMultiplier = options.length * (turns || 1);
        const nextItem = turnsMultiplier + (options.length - selectedIndex);

        animatedValue.setValue(activeItem);
        let animation = Animated.timing(animatedValue, {
            toValue: nextItem,
            easing: Easing?.inOut(Easing.ease),
            duration,
            useNativeDriver: true
        });
        let newActiveItem =
            nextItem > options.length ? nextItem % options.length : nextItem;
        if (newActiveItem === 0) {
            newActiveItem = options.length;
        }
        setActiveItem(newActiveItem)
        await onRotate(options[options.length - newActiveItem]);
        await onRotateChange('start');
        animation.start(async () => {
            await onRotateChange('stop');
        });
    }

    const interpolatedRotateAnimation = animatedValue.interpolate({
        inputRange: [0, props?.options.length],
        outputRange: [`${rouletteRotate}deg`, `${360 + rouletteRotate}deg`],
    });

    const displayOptions = props?.options && props?.options.length > 0 && props?.options[0] && isValidElement(props?.options[0]);

    return (
        <View>
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.container,
                    { width: radius, height: radius, borderRadius: radius / 2 },
                    { transform: [{ rotate: interpolatedRotateAnimation }] },
                    props?.customStyle,
                ]}>
                <ImageBackground
                    width={radius}
                    height={radius}
                    style={{ width: radius, height: radius, zIndex: 100 }}
                    source={background}>
                    {displayOptions &&
                        Children.map(props?.options, (child, index) => (
                            <RouletteItem
                                item={child}
                                index={index}
                                radius={radius}
                                step={step}
                                distance={distance}
                                rouletteRotate={props?.rotateEachElement(index)}
                            />
                        ))}
                </ImageBackground>
            </Animated.View>
            <Image
                source={props?.marker}
                resizeMode="contain"
                style={[
                    styles.marker,
                    {
                        zIndex: 9999,
                        top: markerTop,
                        width: markerWidth,
                        left: radius / 2 - markerWidth / 2,
                    },
                    markerStyle,
                ]}
            />

            {centerImage && (
                <Image
                    source={centerImage}
                    resizeMode="contain"
                    style={[
                        styles.marker,
                        {
                            zIndex: 9999,
                            top: centerTop,
                            width: centerWidth,
                            left: radius / 2 - centerWidth / 2,
                        },
                        props?.centerStyle,
                    ]}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    marker: {
        position: 'absolute',
    },
});

export default forwardRef(Roulette)