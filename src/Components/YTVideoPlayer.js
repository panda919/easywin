import React, { useEffect, useRef, useState } from 'react'
import { View, StatusBar, AppState, Pressable, Linking, Image, StyleSheet } from 'react-native'
import { PLATFORM_IOS, SCREEN_HEIGHT } from '../Constants';
import ImmersiveMode from 'react-native-immersive-mode';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import { updateStatistics } from '../Utils/functions';
import YoutubePlayer from './YoutubePlayer';
import { wp } from '../Helper/ResponsiveScreen';

let videoId = 'jjxg3bwfjdc';
let cdInterval = false;

const YTVideoPlayer = (props) => {
    const ytPlayer = useRef()

    const [videoModalVisible, setVideoModalVisible] = useState(false)
    const [countDown, setCountDown] = useState(4)

    useEffect(() => {
        // if (!PLATFORM_IOS) {
        // ImmersiveMode.fullLayout(false);
        // StatusBar.setBarStyle('light-content');
        // }

        videoId = props?.videoId;
        setVideoModalVisible(true)
        AppState.addEventListener('change', _handleAppStateChange);
        cdInterval = setInterval(() => {
            setCountDown(countDown - 1)
        }, 1000);

        return () => {
            AppState.removeEventListener('change', _handleAppStateChange);
            clearInterval(cdInterval);
            if (!PLATFORM_IOS) {
                ImmersiveMode.fullLayout(true);
                ImmersiveMode.setBarMode('BottomSticky');
                StatusBar.setBarStyle('dark-content');
                StatusBar.setHidden(false);
            } else {
                StatusBar.setBarStyle('dark-content');
                StatusBar.setHidden(false);
            }
        }
    }, [])

    useEffect(() => {
        if (countDown === 0) {
            clearInterval(cdInterval);
        }
    }, [countDown])

    useEffect(() => {
        if (props?.videoId) {
            videoId = props.videoId;
        }
        if (props.videoModalVisible == true) {
            setVideoModalVisible(true)
        }
    }, [props.videoId, props.videoModalVisible])

    const _handleAppStateChange = nextAppState => {
        if (nextAppState === 'active') {
            setTimeout(() => {
                if (ytPlayer?.current && ytPlayer?.current?.playVideo) {
                    ytPlayer?.current?.playVideo();
                }
            }, 250);
        }
    };

    return (
        <Modal
            visible={videoModalVisible}
            animationType="slide"
            style={{ margin: 0, padding: 0 }}
            statusBarTranslucent
            deviceHeight={SCREEN_HEIGHT}>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: Colors.Black,
                    justifyContent: 'center',
                }}>
                <YoutubePlayer
                    ref={ytPlayer}
                    videoId={videoId}
                    autoPlay
                    showFullScreenButton={true}

                    onEnd={props?._stopVideo}
                    onError={(e) => {
                        console.log("err...", e);
                        setTimeout(() => {
                            props?.onError();
                        }, 1500);
                    }}
                />
                <Pressable
                    disabled={!props?.videoClickLink}
                    style={styles.videoClickLinkButton}
                    onPress={() => {
                        // return true
                        if (props.selectedScratch) {
                            const { statistic } = props.selectedScratch;

                            if (typeof statistic === 'string') {
                                const statisticId = statistic.split('/')[2];
                                updateStatistics(statisticId, {
                                    toIncrementClickedAd: 1,
                                });
                            } else if (statistic?.id) {
                                updateStatistics(statistic?.id, {
                                    toIncrementClickedAd: 1,
                                });
                            }
                        }
                        if (props?.videoClickLink) {
                            Linking.openURL(props?.videoClickLink);
                        }
                    }}>
                    <View />
                </Pressable>
                {PLATFORM_IOS && (
                    <>
                        {countDown > 0 ? (
                            <View style={styles.stopVideoView}>
                                <Text
                                    style={{
                                        color: Colors.White,
                                        fontSize: 16,
                                        height: wp(10),
                                        width: wp(10),
                                    }}>
                                    {countDown}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                style={styles.stopVideoView}
                                onPress={props?._stopVideo}>
                                <View>
                                    <Image
                                        source={Images.VIDEO_CROSS_ICON}
                                        style={styles.videoCrossIcon}
                                    />
                                </View>
                            </Pressable>
                        )}
                    </>
                )}
            </SafeAreaView>
        </Modal>
    );
}

export default YTVideoPlayer

const styles = StyleSheet.create({
    videoClickLinkButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: SCREEN_HEIGHT,
        width: SCREEN_HEIGHT,
    },
    stopVideoView: {
        position: 'absolute',
        top: wp(10),
        right: wp(10)
    },
    videoCrossIcon: {
        height: wp(10),
        width: wp(10)
    }
})