import React, { useEffect, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'
import { errorMessage, fetchUserProfileAction, hidePopup, showPopup, updateLocalUserProfileWithDataAction } from '../../Actions'
import Header from '../../Components/Header'
import PopupBase from '../../Components/PopupBase'
import Roulette from '../../Components/Roulette'
import ScreenWrapper from '../../Components/ScreenWrapper'
import Text from '../../Components/Text'
import { hp, wp } from '../../Helper/ResponsiveScreen'
import { LMSText } from '../../Languages/LMSText'
import { Colors } from '../../Styles/Colors'
import { apiGet, timeLeftToday, wheelParticipation } from '../../Utils/functions'
import { Images } from '../../Utils/images'
import commonStyles from '../../Styles/index';
import Lang from '../../Languages/LanguageStr'

let countdownInterval = null;

const WheelPremiumScreen = (props) => {
    const dispatch = useDispatch()
    const roulette = useRef()

    const xp = useSelector((state) => state.userReducer?.userProfile?.xp)
    const wallet = useSelector((state) => state.userReducer?.userProfile?.wallet)
    const userProfile = useSelector((state) => state.userReducer?.userProfile)

    const [loading, setLoading] = useState(true)
    const [wheelOptions, setWheelOptions] = useState(null)
    const [remainingTime, setRemainingTime] = useState('')
    const [rouletteState, setRouletteState] = useState('')
    const [prizeSlots, setPrizeSlots] = useState(null)
    const [wheelCoinsCost, setWheelCoinsCost] = useState(null)
    const [participationsMaxDay, setParticipationsMaxDay] = useState(null)
    const [wonPrizeSlot, setWonPrizeSlot] = useState(null)
    const [wonPrize, setWonPrize] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchUserProfileAction());
            GetWheel()
        }
        fetchData()

        return () => {
            clearInterval(countdownInterval);
        }
    }, [])

    useEffect(() => {
        if (rouletteState !== '' && rouletteState === 'stop') {
            if (wonPrize?.type) {
                let icon = Images.GIFT_PACK;
                let text = '';
                const { type, quantity, productName } = wonPrize;
                switch (type) {
                    case 'bien': {
                        icon = Images.GIFT_PACK;
                        text = `${productName}`;
                        break;
                    }
                    case 'coins': {
                        icon = Images.COINS_ICON;
                        text = `${productName}`;
                        break;
                    }
                    case 'tickets': {
                        icon = Images.MONEY_ICON;
                        text = `${productName}`;
                        break;
                    }
                    case 'challenge_credits': {
                        icon = Images.LIGHTNING_BLUE_FILLED_ICON;
                        text = `${productName}`;
                        break;
                    }
                    case 'scratch_credits': {
                        icon = Images.LIGHTNING_YELLOW_FILLED_ICON;
                        text = `${productName}`;
                        break;
                    }
                    case 'service': {
                        icon = Images.GIFT_PACK;
                        text = `${productName}`;
                        break;
                    }
                    default:
                        break;
                }

                showPopup(
                    <PopupBase
                        buttonTitle={LMSText(Lang.app.close)}
                        imgSrc={icon}
                        onButtonPress={() => {
                            wheelAgainSpinAlert();
                        }}
                        onClose={() => {
                            wheelAgainSpinAlert();
                            GetAllLotsData(prizeSlots);
                        }}
                    // noAutoHide
                    >
                        <View
                            style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: Colors.Black }}>
                                {LMSText(Lang.Wheel.youWon)}
                            </Text>
                            <Text
                                style={{
                                    color: Colors.Black,
                                    fontWeight: '700',
                                    fontSize: 34,
                                    textAlign: 'center',
                                }}>
                                {text}{' '}
                            </Text>
                        </View>
                    </PopupBase>,
                );
            } else {
                wheelAgainSpinAlert();
            }
        }
    }, [rouletteState])

    const GetWheel = async () => {
        setPrizeSlots([])
        const wheel = await apiGet('/wheels/2');
        if (wheel && wheel?.data && wheel?.data?.coins) {
            setWheelCoinsCost(wheel?.data?.coins)
            setParticipationsMaxDay(wheel?.data?.participationsMaxDay)
        }
        let prizeSlots = [
            { prizeSlot: 1, type: null, percent: 0 },
            { prizeSlot: 2, type: null, percent: 0 },
            { prizeSlot: 3, type: null, percent: 0 },
            { prizeSlot: 4, type: null, percent: 0 },
            { prizeSlot: 5, type: null, percent: 0 },
            { prizeSlot: 6, type: null, percent: 0 },
            { prizeSlot: 7, type: null, percent: 0 },
            { prizeSlot: 8, type: null, percent: 0 },
        ];

        GetAllLotsData(prizeSlots);

        countdownInterval = setInterval(() => {
            let { hours, minutes, seconds } = timeLeftToday();
            if (
                xp?.wheelParticipationSpend >= participationsMaxDay &&
                hours > 22 &&
                minutes > 57 &&
                seconds % 10 == 9
            ) {
                //fetch profile evey 10 sec for minut 58 and 59 if spent
                dispatch(fetchUserProfileAction());
            }
            setRemainingTime(` ${hours > 9 ? hours : '0' + hours} :  ${minutes > 9 ? minutes : '0' + minutes
                } : ${seconds > 9 ? seconds : '0' + seconds}`)
        }, 1000);
    }

    const GetAllLotsData = async (prizeSlots) => {
        const prizes = await apiGet('/wheel_lots?wheel=2&archive=false');
        if (prizes?.data && prizes?.data['hydra:member'] != undefined) {

            let filterprizeSlots = prizes?.data['hydra:member'].filter(obj => obj.quantity > 0)

            await filterprizeSlots.forEach(prize => {
                const prizeSlot = parseInt(prize.prize.substring(5));

                prizeSlots[prizeSlot - 1] = { ...prize, prizeSlot };
            });

            const wheelOptions = prizeSlots.map(prize => (
                <View index={prize.prizeSlot}>
                    {optionContent(prize)}
                </View>
            ));

            setWheelOptions(wheelOptions)
            setPrizeSlots(prizeSlots)
        }
        setLoading(false)
    }

    const wheelAgainSpinAlert = () => {
        if (xp?.wheelParticipationSpend < participationsMaxDay) {
            showPopup(
                <PopupBase
                    title={'Le prochain tour sera-t-il le bon ?'}
                    description={'Relance la roulette et croise les doigts!'}
                    imgSrc={Images.RELAUNCH_ICON}
                    popupStyle={{ minHeight: undefined }}
                >
                    <View
                        style={styles.relaunchContent}>
                        <Pressable
                            onPress={() => {
                                if (wallet?.coin >= wheelCoinsCost) {
                                    let newUserProfile = userProfile;
                                    newUserProfile.xp.wheelParticipationSpend =
                                        userProfile.wheelParticipationSpend + 1;
                                    newUserProfile.wallet.coin =
                                        userProfile.wallet.coin - wheelCoinsCost;
                                    dispatch(updateLocalUserProfileWithDataAction(
                                        newUserProfile,
                                    ));
                                    roulette?.current?.triggerSpin();
                                } else {
                                    errorMessage(LMSText(Lang.user.insufficientCoins));
                                }
                                hidePopup();
                            }}>
                            <LinearGradient
                                colors={['#FFDB0F', '#FFB406']}
                                style={styles.rejouerButton}>
                                <Image
                                    source={Images.COINS_ICON}
                                    style={{ width: wp(6.5), height: wp(6.5) }}
                                />
                                <Text
                                    style={{
                                        color: Colors.Black,
                                        fontSize: 17,
                                        fontWeight: '700',
                                        paddingHorizontal: hp(1)
                                    }}>
                                    Rejouer
                                </Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                hidePopup();
                            }}>
                            <LinearGradient
                                colors={['#FFDB0F', '#FFB406']}
                                style={styles.rejouerButton}>
                                <Text
                                    style={{
                                        color: Colors.Black,
                                        fontSize: 17,
                                        fontWeight: '700',
                                        paddingHorizontal: hp(1)
                                    }}>
                                    Quitter
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </PopupBase>,
            );
        }
    };

    const onRotationStateChange = state => {
        setRouletteState(state)
    };

    const onRotate = option => {
        setWonPrizeSlot(option?.props?.index - 1)
        setWonPrize(prizeSlots[option?.props?.index - 1])


        setTimeout(async () => {
            const wonPrize = prizeSlots[option?.props?.index - 1]

            await wheelParticipation({
                lotId: wonPrize?.id,
                prize: wonPrize.prize ? wonPrize.prize : null,
                wheel: 2,
            });

            if (wonPrize?.quantity == 1) {
                GetWheel();
            } else {
                await GetAllLotsData(prizeSlots);
            }

            dispatch(fetchUserProfileAction());
        }, 1000);
    };

    const optionContent = (prize) => {
        switch (prize?.type) {
            case 'coins':
                return (
                    <View
                        style={{ flexDirection: prize.quantity > 999 ? 'column' : 'row' }}>
                        <Text
                            style={{
                                color: prize.prizeSlot % 2 ? Colors.White : Colors.Black,
                                fontSize: prize.quantity > 999 ? 14 : 19,
                                fontWeight: '700',
                            }}>
                            {prize?.quantity}
                        </Text>
                        <Image
                            source={Images.COINS_ICON}
                            style={[styles.optionImage, {
                                transform: [{ rotate: '100deg' }],
                            }]}
                        />
                    </View>
                );

            case 'tickets':
                return (
                    <View
                        style={{ flexDirection: prize.quantity > 999 ? 'column' : 'row' }}>
                        <Text
                            style={{
                                color: prize?.prizeSlot % 2 ? Colors.White : Colors.Black,
                                fontSize: prize?.quantity > 999 ? 14 : 19,
                                fontWeight: '700',
                            }}>
                            {prize?.quantity}
                        </Text>
                        <Image
                            source={Images.MONEY_ICON}
                            style={styles.optionImage}
                        />
                    </View>
                );
            case 'bien':
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Image
                            source={Images.GIFT_ICON}
                            style={[styles.optionImage, {
                                width: wp(9),
                                height: wp(9),
                            }]}
                        />
                    </View>
                );
            case 'service':
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Image
                            source={Images.GIFT_ICON}
                            style={[styles.optionImage, {
                                width: wp(9),
                                height: wp(9),
                            }]}
                        />
                    </View>
                );
            case 'challenge_credits':
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            style={{
                                color: prize?.prizeSlot % 2 ? Colors.White : Colors.Black,
                                fontSize: prize?.quantity > 999 ? 14 : 19,
                                fontWeight: '700',
                            }}>
                            {prize?.quantity}
                        </Text>
                        <Image
                            source={Images.LIGHTNING_BLUE_FILLED_ICON}
                            style={[styles.optionImage, {
                                width: wp(9),
                                height: wp(9),
                            }]}
                        />
                    </View>
                );
            case 'scratch_credits':
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            style={{
                                color: prize?.prizeSlot % 2 ? Colors.White : Colors.Black,
                                fontSize: prize?.quantity > 999 ? 14 : 19,
                                fontWeight: '700',
                            }}>
                            {prize?.quantity}
                        </Text>
                        <Image
                            source={Images.LIGHTNING_YELLOW_FILLED_ICON}
                            style={[styles.optionImage, {
                                width: wp(9),
                                height: wp(9),
                            }]}
                        />
                    </View>
                );
            default:
                return null; // return <Text style={{ color: prize.prizeSlot % 2 ? Colors.White : Colors.Black, fontSize: 24, fontWeight: '700' }} >{prize.prizeSlot}</Text>
        }
    }

    return (
        <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
            <Header />
            {wheelOptions ? (
                <View style={styles.centerView}>
                    <Roulette
                        ref={roulette}
                        distance={wp(24)}
                        radius={wp(90)}
                        enableUserRotate={!(xp?.wheelParticipationSpend >= participationsMaxDay)}
                        background={Images.WHEEL_PREMIUM_BG}
                        marker={Images.MARKER}
                        onRotate={(option) => onRotate(option)}
                        onRotateChange={(state) => onRotationStateChange(state)}
                        options={wheelOptions}
                        prizeSlots={prizeSlots}
                        rotateEachElement={index =>
                            ((index * 360) / wheelOptions.length) * -1 - 90
                        }
                        markerWidth={wp(5)}
                    />
                    {wheelCoinsCost && (
                        <Pressable
                            disabled={
                                rouletteState == 'start' ||
                                xp?.wheelParticipationSpend >= participationsMaxDay
                            }
                            onPress={() => {
                                if (xp?.wheelParticipationSpend < participationsMaxDay) {
                                    if (wallet?.coin >= wheelCoinsCost) {
                                        let newUserProfile = userProfile;
                                        newUserProfile.xp.wheelParticipationSpend =
                                            userProfile.wheelParticipationSpend + 1;
                                        newUserProfile.wallet.coin =
                                            userProfile.wallet.coin - wheelCoinsCost;
                                        dispatch(updateLocalUserProfileWithDataAction(
                                            newUserProfile,
                                        ));
                                        roulette?.current?.triggerSpin();
                                    } else {
                                        errorMessage(LMSText(Lang.user.insufficientCoins));
                                    }
                                } else {
                                    errorMessage(LMSText(Lang.user.premiumWheelDailyLimit));
                                }
                            }}>
                            <View
                                style={[styles.coinPiecesButton, {
                                    backgroundColor:
                                    xp?.wheelParticipationSpend >= participationsMaxDay
                                            ? Colors.APP_GRAY_COLOR
                                            : Colors.Black
                                }]}>
                                <Text
                                    style={{
                                        color: Colors.White,
                                        fontSize: 13,
                                        fontWeight: '400',
                                        textAlign: 'center'
                                    }}>
                                    {` ${wheelCoinsCost}  `}
                                </Text>
                                <Image
                                    source={Images.COIN_ICON}
                                    style={styles.coinIcon}
                                />
                                {xp?.wheelParticipationSpend >= participationsMaxDay && <Text
                                    style={{
                                        color: Colors.White,
                                        fontSize: 13,
                                        fontWeight: '400',
                                        textAlign: 'center'
                                    }}>
                                    {` ${xp?.wheelParticipationSpend >= participationsMaxDay ? remainingTime : ''} `}
                                </Text>}
                            </View>
                        </Pressable>
                    )}
                </View>
            ) : (
                <View style={styles.noLoadwheel}>
                    {loading ? (
                        <Loader />
                    ) : (
                        <Text style={{ color: Colors.Black, textAlign: 'center' }}>
                            Could not load wheel
                        </Text>
                    )}
                </View>
            )}
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    centerView: {
        alignItems: 'center'
    },
    optionImage: {
        transform: [{ rotate: '90deg' }],
        marginLeft: wp(2.5),
        marginRight: 0,
        width: wp(8),
        height: wp(8),
    },
    relaunchContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: wp(100),
        marginVertical: hp(2),
    },
    rejouerButton: {
        flexDirection: 'row',
        height: hp(5),
        paddingHorizontal: wp(5),
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinPiecesButton: {
        marginVertical: hp(1),
        width: wp(100) * 0.6,
        borderRadius: 100,
        height: hp(4),
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    coinIcon: {
        width: wp(4),
        height: wp(4)
    },
    noLoadwheel: {
        marginTop: hp(2)
    }
})

export default WheelPremiumScreen