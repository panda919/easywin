import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { PLATFORM_ANDROID } from '../../Helper/ResponsiveScreen';
import ProgressBar from './ProgressBar';

const TIME_TO_HIDE_CONTROLS = 2000;

const PlayerControls = ({
    play,
    ready,
    duration,
    currentTime,
    playVideo,
    pauseVideo,
    seekTo,
    fullScreen,
}) => {
    const [visible, setVisible] = useState(true);
    const ref = useRef(0);

    useEffect(() => {
        hideControls();
        return () => {
            clearTimeout(ref.current);
        };
    }, [play, ready]);

    const hideControls = () => {
        if (ref.current !== 0) clearTimeout(ref.current);
        if (play && ready) {
            ref.current = setTimeout(() => {
                setVisible(false);
            }, TIME_TO_HIDE_CONTROLS);
        }
    };
    const hideAfterExecute = (action) => {
        hideControls();
        return action;
    };

    const progress = currentTime !== 0 && duration !== 0 ? currentTime / duration : 0;

    return (
        <View
            style={[
                styles.container,
                {
                    paddingLeft: fullScreen ? 40 : 0,
                    paddingRight: fullScreen ? (PLATFORM_ANDROID ? 0 : 40) : 0,
                },
            ]}
            pointerEvents="auto">
            {!ready && <ActivityIndicator size="small" color="#FFF" />}
            <ProgressBar
                value={progress}
                {...{
                    fullScreen,
                    visible,
                    seekTo,
                    duration,
                    currentTime,
                    pauseVideo,
                    playVideo,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    upperView: {
        ...StyleSheet.absoluteFillObject,
    },
    controls: {
        ...StyleSheet.absoluteFillObject,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    footer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        marginRight: 0,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progress: {
        width: '100%',
        height: 2,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'red',
    },
});

export default PlayerControls