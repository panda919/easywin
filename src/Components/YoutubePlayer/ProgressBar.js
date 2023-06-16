import React, { useRef } from 'react'
import Animated, { EasingNode } from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../Styles/Colors';

const Progress = ({ progress }) => {
    const ref = useRef(new Animated.Value(0));
    Animated.timing(ref.current, {
        toValue: progress,
        duration: 250,
        easing: EasingNode.inOut(EasingNode.ease),
    }).start();

    return (
        <View style={styles.outerBar}>
            <Animated.View
                style={{ flex: ref.current, backgroundColor: 'red', height: 2 }}
            />
        </View>
    );
};

const ProgressBar = ({
    value,
    duration,
    currentTime,
    fullScreen,
}) => {
    return (
        <View style={[styles.container, { bottom: fullScreen ? 4 : 0 }]}>
            <View
                style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 100,
                }}>
                <Text style={{ color: 'white', fontSize: 16 }}>
                    {(duration - currentTime).toFixed(0)}
                </Text>
            </View>
            <Progress progress={value} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 0, // animated to 20 on fullScreen
    },
    progress: {
        width: '100%',
        height: 8,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent',
        transform: [{ translateY: 3 }],
    },
    outerBar: {
        flex: 1,
        height: 2,
        alignItems: 'flex-end',
        flexDirection: 'row',
        backgroundColor: Colors.White,
        width: '100%',
    },
});

export default ProgressBar