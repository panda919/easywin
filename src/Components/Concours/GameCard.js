import { Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect } from 'react'
import { hp, wp } from '../../Helper/ResponsiveScreen'
import commonStyles from '../../Styles/index'
import CustomImage from '../CustomImage'
import { Images } from '../../Utils/images'
import useBackgroundTimer from '../useBackgroundTimer'
import LinearGradient from 'react-native-linear-gradient'
import { BlurView } from '@react-native-community/blur'
import { PLATFORM_IOS, SERVER_BASE } from '../../Constants'
import Text from '../Text'
import { Colors } from '../../Styles/Colors'
import moment from 'moment'

const GameCard = ({ item, userProfile, viewRef, onPressItem, onPressChance, onPressParticiper }) => {
    const haveParticipated =
        userProfile?.competitionParticipationsDetails?.findIndex(
            (competitionParticipation) =>
                competitionParticipation?.competition &&
                competitionParticipation?.competition['@id'].substring(14) == item?.id,
        ) > -1 ? true : false;

    const {
        time: showTime,
        startTimer,
        stopTimer,
        hasTimerEnded,
        isTimerRunning,
    } = useBackgroundTimer(item?.endAt);

    useEffect(() => {
        startTimer();
        return () => {
            stopTimer();
        };
    }, []);

    let days = parseInt(showTime / 86400, 10);
    let hourshowTime = showTime % 86400;
    let hours = parseInt(hourshowTime / 3600, 10);
    let minShowTime = hourshowTime % 3600;
    let seconds = parseInt(minShowTime % 60, 10);
    let minutes = parseInt(minShowTime / 60, 10);

    return (
        <TouchableWithoutFeedback onPress={onPressItem}>
            <View style={[styles.content, { ...commonStyles.SHADOW }]}>
                <CustomImage
                    source={
                        item?.imageUrl
                            ? { uri: `${SERVER_BASE}${item?.imageUrl}` }
                            : Images.bggifts
                    }
                    contentContainerStyle={{
                        justifyContent: days == 0 && isTimerRunning ? 'space-between' : 'flex-end',
                    }}
                    style={styles.customImageStyle}>
                    {days == 0 && isTimerRunning && (
                        <LinearGradient
                            start={{ x: 0.0, y: 1.0 }}
                            end={{ x: 1.0, y: 0.5 }}
                            colors={['rgb(178,71,67)', 'rgb(231,175,88)']}
                            style={styles.timerLinearStyle}>
                            <View style={styles.countdownView}>
                                <Image
                                    source={Images.CHALLANGE_COUNTDOWN_CLOCK_ICON}
                                    style={styles.clockIcon}
                                />
                                <Text style={{
                                    fontSize: 21,
                                    fontWeight: 'bold',
                                    marginRight: wp(2.5)
                                }}>
                                    {`${hours < 10 ? '0' + hours : hours}h ${minutes < 10 ? '0' + minutes : parseInt(minutes)
                                        }m ${seconds < 10 ? '0' + seconds : parseInt(seconds)
                                        }s`}
                                </Text>
                            </View>
                        </LinearGradient>
                    )}
                    <View
                        style={styles.blurDarkContent}>
                        {PLATFORM_IOS ? (
                            <BlurView
                                style={styles.blurViewStyle}
                                viewRef={viewRef}
                                blurType="dark"
                                blurAmount={30}
                                reducedTransparencyFallbackColor="transparent"
                            />
                        ) : (
                            <View
                                style={[styles.blurViewStyle, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                            />
                        )}
                        <Text
                            numberOfLines={2}
                            style={{
                                padding: hp(0.5),
                                paddingLeft: wp(2.5),
                                flex: 1,
                                fontSize: 18,
                                fontWeight: '700',
                            }}>
                            {item?.name}
                        </Text>
                        {/* isEnded && Removed by naveed of at yanick request for test case  */}
                        {<View
                            style={styles.participerButtonContent}>
                            <LinearGradient
                                colors={
                                    hasTimerEnded
                                        ? ['#777777', '#777777']
                                        : ['#FFDB0F', '#FFB406']
                                }
                                style={styles.linearStyle}>
                                {haveParticipated ? (
                                    <TouchableOpacity
                                        disabled={hasTimerEnded}
                                        onPress={onPressChance}>
                                        <View
                                            style={styles.participerButton}>
                                            <Text
                                                style={{
                                                    color: Colors.Black,
                                                    fontWeight: '700',
                                                    fontSize: 15,
                                                    paddingHorizontal: hp(0.3),
                                                }}>
                                                {hasTimerEnded ? 'Game is Over' : '+ DE CHANCES'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        disabled={hasTimerEnded}
                                        onPress={onPressParticiper}>
                                        <View
                                            style={styles.participerButton}>
                                            {item.type === 'sponsored' && (
                                                <>
                                                    <Text
                                                        style={{
                                                            color: Colors.APP_BLUE_COLOR,
                                                            fontWeight: '700',
                                                            fontSize: 12,
                                                            paddingHorizontal: hp(0.2),
                                                        }}>
                                                        1
                                                    </Text>
                                                    <Image
                                                        source={Images.LIGHTNING_BLUE_FILLED_ICON}
                                                        style={styles.lightiningBlueIcon}
                                                    />
                                                </>
                                            )}
                                            <Text
                                                style={{
                                                    color: Colors.Black,
                                                    fontWeight: '700',
                                                    fontSize: 15,
                                                    paddingHorizontal: hp(0.3),
                                                }}>
                                                {hasTimerEnded ? 'Game is Over' : 'PARTICIPER'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </LinearGradient>
                            <Text
                                style={{
                                    fontSize: 9,
                                    fontWeight: '400',
                                    fontFamily: 'Montserrat-Medium'
                                }}>
                                {`Tirage le ${moment(item?.endAt).format('DD/MM/yyyy')}`}
                            </Text>
                        </View>}
                    </View>
                </CustomImage>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default GameCard

const styles = StyleSheet.create({
    content: {
        marginHorizontal: wp(5),
        marginTop: hp(2.75),
        borderRadius: wp(5),
    },
    customImageStyle: {
        borderRadius: wp(5),
        height: wp(53),
        width: wp(90),
    },
    timerLinearStyle: {
        padding: hp(0.4),
        alignSelf: 'flex-end',
        borderBottomLeftRadius: 20,
    },
    countdownView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    clockIcon: {
        height: wp(7),
        width: wp(7),
        marginHorizontal: wp(2.5),
    },
    blurDarkContent: {
        alignItems: 'center',
        flexDirection: 'row',
        height: hp(7),
        borderBottomLeftRadius: wp(5),
        borderBottomRightRadius: wp(5),
        overflow: 'hidden',
    },
    blurViewStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: 0,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0
    },
    participerButtonContent: {
        height: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    participerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: hp(0.7),
    },
    participerText: {
        color: Colors.Black,
        fontWeight: '700',
        fontSize: 15,
        paddingHorizontal: hp(0.3),
    },
    lightiningBlueIcon: {
        height: wp(6),
        width: wp(4),
        resizeMode: 'contain'
    },
    linearStyle: {
        marginHorizontal: wp(2.5),
        borderRadius: wp(10)
    }
})
