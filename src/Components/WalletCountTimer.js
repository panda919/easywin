import React, { useEffect, useMemo } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { hp, wp } from '../Helper/ResponsiveScreen';
import { Colors } from '../Styles/Colors';
import { Images } from '../Utils/images';
import Text from './Text';
import useBackgroundTimer from './useBackgroundTimer';

const headerImageSize = wp(18);

const CountTimer = ({ wallet, walletType, level, onTicketPress, onCoinPress }) => {

    const { scratchMaxLimit, challengeMaxLimit } = useMemo(() => {
        if (level == 3) {
            return { scratchMaxLimit: 5, challengeMaxLimit: 17 };
        } else if (level > 3) {
            return { scratchMaxLimit: 6, challengeMaxLimit: 19 };
        }
        return { scratchMaxLimit: 4, challengeMaxLimit: 15 };
    }, []);

    const {
        time: scratchDuration,
        startTimer: startScratchTimer,
        stopTimer: stopScratchTimer,
    } = useBackgroundTimer(wallet?.scratchTime, 180, wallet, level);

    const {
        time: challengeDuration,
        startTimer: startChallengeTimer,
        stopTimer: stopChallengeTimer,
    } = useBackgroundTimer(wallet?.challengeTime, 60, wallet, level);


    useEffect(() => {
        if (wallet?.scratchTime && wallet?.scratchCredit < scratchMaxLimit) {
            startScratchTimer();
        }
        if (wallet?.challengeTime && wallet?.challengeCredit < challengeMaxLimit) {
            startChallengeTimer();
        }
        return () => {
            stopChallengeTimer();
            stopScratchTimer();
        };
    }, [
        wallet?.challengeCredit,
        wallet?.challengeTime,
        wallet?.scratchCredit,
        wallet?.scratchTime,
    ]);

    const secondsScratch = Math.floor(scratchDuration % 60);
    const minutesScratch = Math.floor((scratchDuration / 60) % 60);
    const hoursScratch = Math.floor((scratchDuration / (60 * 60)) % 24);
    // const daysScratch = Math.floor(scratchDuration / (60 * 60 * 24));

    const secondsChallenge = Math.floor(challengeDuration % 60);
    const minutesChallenge = Math.floor((challengeDuration / 60) % 60);
    const hoursChallenge = Math.floor((challengeDuration / (60 * 60)) % 24);
    // const daysChallenge = Math.floor(challengeDuration / (60 * 60 * 24));

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
            {walletType == 'credit' ? (
                <View
                    style={styles.creditMainContent}>
                    <View
                        style={styles.creditView}>
                        <View>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: headerImageSize - wp(2.5),
                                    height: ((headerImageSize * (wallet?.challengeCredit > 15 ? 15 : wallet?.challengeCredit)) / 15) || 0,
                                    backgroundColor: Colors.APP_BLUE_COLOR,
                                }}
                            />
                            <Image
                                style={{ height: headerImageSize, width: headerImageSize }}
                                source={Images.LIGHTNING_BLUE_ICON}
                            />
                        </View>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 15,
                                fontWeight: '600',
                                marginVertical: hp(1.5),
                                color: Colors.Blue
                            }}>
                            {wallet?.challengeTime && wallet?.challengeCredit < challengeMaxLimit ? challengeTime : `00 : 00 : 00`}
                        </Text>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 15,
                                fontWeight: '800',
                                marginTop: -hp(0.2),
                                color: Colors.Blue
                            }}>
                            {'CRÉDITS\nCONCOURS'}
                        </Text>
                    </View>
                    <View
                        style={[styles.creditView, {
                            marginLeft: wp(4.4),
                        }]}>
                        <View>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    width: headerImageSize,
                                    height:
                                        ((headerImageSize *
                                            (wallet?.scratchCredit > 4 ? 4 : wallet?.scratchCredit)) /
                                            4) || 0,
                                    backgroundColor: Colors.YELLOW,
                                }}
                            />
                            <Image
                                style={{
                                    height: headerImageSize,
                                    width: headerImageSize,
                                    resizeMode: 'contain',
                                }}
                                source={Images.LIGHTNING_YELLOW_ICON}
                            />
                        </View>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 15,
                                fontWeight: '600',
                                marginVertical: hp(1.5),
                                color: Colors.yellow2
                            }}>
                            {wallet?.scratchTime && wallet?.scratchCredit < scratchMaxLimit ? scratchTime : `00 : 00 : 00`}
                        </Text>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontSize: 15,
                                fontWeight: '800',
                                marginTop: -hp(0.2),
                                color: Colors.yellow2
                            }}>
                            {'CRÉDITS\nGRATTAGE'}
                        </Text>
                    </View>
                </View>
            ) : (
                <View
                    style={styles.ticketCoinContent}>
                    <Pressable
                        onPress={() => onTicketPress()}>
                        <View
                            style={[styles.boxView, {
                                borderWidth: walletType == 'tickets' ? 3 : 0.6,
                                borderColor: walletType == 'tickets' ? Colors.Green : Colors.Gray2,
                            }]}>
                            <Image
                                style={{ height: headerImageSize, width: headerImageSize }}
                                source={Images.MONEY_ICON}
                            />
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 22,
                                    fontWeight: '900',
                                    marginTop: hp(1),
                                    color: Colors.Green
                                }}>
                                {wallet?.ticket}
                            </Text>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 10,
                                    marginTop: -hp(0.2),
                                    color: Colors.Green,
                                }}>
                                BILLETS
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => onCoinPress()}>
                        <View
                            style={[styles.boxView, {
                                borderWidth: walletType == 'coins' ? 3 : 0.6,
                                borderColor: walletType == 'coins' ? Colors.Yellow3 : Colors.Gray2,
                                marginLeft: wp(4.4),
                            }]}>
                            <Image
                                style={{ height: headerImageSize, width: headerImageSize }}
                                source={Images.COINS_ICON}
                            />
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 22,
                                    fontWeight: '900',
                                    marginTop: hp(1),
                                    color: Colors.Yellow3
                                }}>
                                {wallet?.coin}
                            </Text>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontSize: 10,
                                    marginTop: -hp(0.2),
                                    color: Colors.Yellow3
                                }}>
                                PIÈCES
                            </Text>
                        </View>
                    </Pressable>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    creditMainContent: {
        marginTop: hp(3.5),
        flexDirection: 'row',
        marginHorizontal: wp(7.5),
        justifyContent: 'center',
    },
    creditView: {
        alignItems: 'center',
        width: wp(100) / 2 - wp(12.5),
        height: hp(22),
    },
    ticketCoinContent: {
        marginTop: hp(1.8),
        flexDirection: 'row',
        marginHorizontal: wp(7.5),
        justifyContent: 'center',
    },
    boxView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(100) / 2 - 32,
        borderRadius: 15,
        height: hp(22),
    },
})

export default CountTimer