import React, { useEffect, useMemo, useRef } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import Text from './Text';
import moment from 'moment';
import useBackgroundTimer from './useBackgroundTimer';
import { hp, wp } from '../Helper/ResponsiveScreen';

const maxRefreshRetry = 2;
const refreshDelaySec = 5;

const CountTimer = (props) => {

    const latestCallMoment = useRef(moment());
    const refreshCount = useRef(0);

    const { scratchMaxLimit, challengeMaxLimit } = useMemo(() => {
        if (props?.level == 3) {
            return { scratchMaxLimit: 5, challengeMaxLimit: 17 };
        } else if (props?.level > 3) {
            return { scratchMaxLimit: 6, challengeMaxLimit: 19 };
        }
        return { scratchMaxLimit: 4, challengeMaxLimit: 15 };
    }, []);

    const {
        time: scratchDuration,
        startTimer: startScratchTimer,
        stopTimer: stopScratchTimer,
    } = useBackgroundTimer(props?.wallet?.scratchTime, 180, props?.wallet, props?.level, "showScratchCredits");

    const {
        time: challengeDuration,
        startTimer: startChallengeTimer,
        stopTimer: stopChallengeTimer,
    } = useBackgroundTimer(props?.wallet?.challengeTime, 60, props?.wallet, props?.level, "showChallangeCredits");


    const secondsScratch = Math.floor(scratchDuration % 60);
    const minutesScratch = Math.floor((scratchDuration / 60) % 60);
    const hoursScratch = Math.floor((scratchDuration / (60 * 60)) % 24);
    // const daysScratch = Math.floor(scratchDuration / (60 * 60 * 24));

    const secondsChallenge = Math.floor(challengeDuration % 60);
    const minutesChallenge = Math.floor((challengeDuration / 60) % 60);
    const hoursChallenge = Math.floor((challengeDuration / (60 * 60)) % 24);
    // const daysChallenge = Math.floor(challengeDuration / (60 * 60 * 24));

    useEffect(() => {
        if (
            props?.showScratchCredits &&
            props?.wallet?.scratchTime &&
            props?.wallet?.scratchCredit < scratchMaxLimit
        ) {
            startScratchTimer();
        }
        if (
            props?.showChallangeCredits &&
            props?.wallet?.challengeTime &&
            props?.wallet?.challengeCredit < challengeMaxLimit
        ) {
            startChallengeTimer();
        }
        return () => {
            stopChallengeTimer();
            stopScratchTimer();
        };
    }, [
        challengeMaxLimit,
        scratchMaxLimit,
        props?.showChallangeCredits,
        props?.showScratchCredits,

        props?.wallet?.challengeCredit,
        props?.wallet?.challengeTime,
        props?.wallet?.scratchCredit,
        props?.wallet?.scratchTime,
    ]);

    useEffect(() => {
        if (
            (scratchDuration <= 0 || challengeDuration <= 0) &&
            refreshCount.current < maxRefreshRetry
        ) {
            const nowMoment = moment();
            if (
                nowMoment.diff(latestCallMoment.current, 'seconds') < refreshDelaySec
            ) {
                latestCallMoment.current = nowMoment;
                props?.fetchUserProfileAction();
            }
        }
    }, []);

    const scratchTime = `${hoursScratch > -1
        ? hoursScratch < 10
            ? '0' + hoursScratch
            : hoursScratch
        : '00'
        } : ${minutesScratch > -1
            ? minutesScratch < 10
                ? '0' + minutesScratch
                : minutesScratch
            : '00'
        } : ${secondsScratch > -1
            ? secondsScratch < 10
                ? '0' + secondsScratch
                : secondsScratch
            : '00'
        }`;

    const challengeTime = `${hoursChallenge > -1
        ? hoursChallenge < 10
            ? '0' + hoursChallenge
            : hoursChallenge
        : '00'
        } : ${minutesChallenge > -1
            ? minutesChallenge < 10
                ? '0' + minutesChallenge
                : minutesChallenge
            : '00'
        } : ${secondsChallenge > -1
            ? secondsChallenge < 10
                ? '0' + secondsChallenge
                : secondsChallenge
            : '00'
        }`;


    return (
        <>
            {props?.showChallangeCredits && (
                <Pressable
                    onPress={() => {
                        props?.onGoToWalletScreen('credit');
                    }}
                    style={styles.content}>
                    <View style={styles.imageView}>
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                marginHorizontal: wp(0.4),
                                width: props?.headerImageSize - 8,
                                height:
                                    ((props?.headerImageSize * (props?.wallet?.challengeCredit > 15
                                        ? 15
                                        : props?.wallet?.challengeCredit)) /
                                        15) || 0,
                                backgroundColor: Colors.APP_COLOR,
                            }}
                        />
                        <Image
                            style={{ height: props?.headerImageSize, width: props?.headerImageSize }}
                            resizeMode="contain"
                            source={Images.LIGHTNING_BLUE_ICON}
                        />
                    </View>
                    <View
                        style={{
                            marginTop: -hp(1.9),
                            backgroundColor: Colors.White,
                            borderColor: Colors.APP_BLUE_COLOR,
                            borderWidth: 1,
                            borderRadius: props?.headerImageSize,
                        }}>
                        <Text
                            style={{
                                minWidth: props?.headerImageSize + 5,
                                fontSize: 10,
                                paddingHorizontal: wp(1.25),
                                ...styles.blueTextStyles
                            }}>
                            {props?.wallet?.challengeCredit}/{challengeMaxLimit}
                        </Text>
                    </View>
                    {
                        <View
                            style={{
                                marginTop: -wp(0.4),
                                borderTopWidth: 0,
                                backgroundColor: Colors.White,
                                borderColor: Colors.APP_BLUE_COLOR,
                                borderWidth: 1,
                                borderRadius: props?.headerImageSize,
                            }}>
                            <Text
                                style={{
                                    minWidth: props?.headerImageSize - 5,
                                    fontSize: 7,
                                    paddingHorizontal: wp(0.2),
                                    ...styles.blueTextStyles
                                }}>
                                {props?.showChallangeCredits &&
                                    props?.wallet?.challengeTime &&
                                    props?.wallet?.challengeCredit < challengeMaxLimit ? challengeTime : `00 : 00 : 00`}
                            </Text>
                        </View>
                    }
                </Pressable>
            )}
            {props?.showScratchCredits && (
                <Pressable
                    onPress={() => {
                        props?.onGoToWalletScreen('credit');
                    }}
                    style={styles.content}>
                    <View style={styles.imageView}>
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                marginHorizontal: wp(0.4),
                                width: props?.headerImageSize - 8,
                                height: ((props?.headerImageSize * (
                                    props?.wallet?.scratchCredit > 4 ? 4 : props?.wallet?.scratchCredit)) / 4) || 0,
                                backgroundColor: Colors.YELLOW,
                            }}
                        />
                        <Image
                            style={{ height: props?.headerImageSize, width: props?.headerImageSize }}
                            resizeMode="contain"
                            source={Images.LIGHTNING_YELLOW_ICON}
                        />
                    </View>
                    <View
                        style={{
                            marginTop: -hp(1.9),
                            backgroundColor: Colors.White,
                            borderColor: Colors.APP_YELLOW_COLOR,
                            borderWidth: 1,
                            borderRadius: props?.headerImageSize,
                        }}>
                        <Text
                            style={{
                                minWidth: props?.headerImageSize + 5,
                                fontSize: 10,
                                paddingHorizontal: wp(1.25),
                                ...styles.yellowTextStyles
                            }}>
                            {props?.wallet?.scratchCredit}/{scratchMaxLimit}
                        </Text>
                    </View>
                    {
                        <View
                            style={{
                                marginTop: -wp(0.4),
                                borderTopWidth: 0,
                                backgroundColor: Colors.White,
                                borderColor: Colors.APP_YELLOW_COLOR,
                                borderWidth: 1,
                                borderRadius: props?.headerImageSize,
                            }}>
                            <Text
                                style={{
                                    minWidth: props?.headerImageSize - 5,
                                    fontSize: 7,
                                    paddingHorizontal: wp(0.2),
                                    ...styles.yellowTextStyles
                                }}>
                                {props?.showScratchCredits &&
                                    props?.wallet?.scratchTime &&
                                    props?.wallet?.scratchCredit < scratchMaxLimit ? scratchTime : `00 : 00 : 00`}
                            </Text>
                        </View>
                    }
                </Pressable>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'center'
    },
    imageView: {
        marginHorizontal: wp(1.1)
    },
    yellowTextStyles: {
        fontFamily: 'Helvetica Neue',
        textAlign: 'center',
        padding: 0,
        fontWeight: '700',
        color: Colors.APP_YELLOW_COLOR,
    },
    blueTextStyles: {
        fontFamily: 'Helvetica Neue',
        textAlign: 'center',
        padding: 0,
        fontWeight: '700',
        color: Colors.APP_BLUE_COLOR,
    }
})

export default CountTimer