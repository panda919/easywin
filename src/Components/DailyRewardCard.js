import React, { useState } from 'react'
import { Animated, Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { hp, wp } from '../Helper/ResponsiveScreen'
import { Colors } from '../Styles/Colors'
import { Images } from '../Utils/images'

const DailyRewardCard = (props) => {
    const [animatedTitle, setAnimatedTitle] = useState(1)
    const [marginRight, setMarginRight] = useState(0)
    const [showTitle, setShowTitle] = useState(false)

    let icon = Images.GIFT_ICON;
    let text = false;
    const { reward } = props;
    const { challengeCredits, scratchCredits, tickets, coins } = reward;
    if (coins) {
        text = coins;
        icon = Images.COINS_ICON;
    } else if (tickets) {
        text = tickets;
        icon = Images.MONEY_ICON;
    } else if (challengeCredits) {
        text = challengeCredits;
        icon = Images.LIGHTNING_BLUE_FILLED_ICON;
    } else if (scratchCredits) {
        text = scratchCredits;
        icon = Images.LIGHTNING_YELLOW_FILLED_ICON;
    }

    if (
        (coins && tickets) ||
        (coins && scratchCredits) ||
        (coins && challengeCredits) ||
        (tickets && scratchCredits) ||
        (tickets && challengeCredits) ||
        (scratchCredits && challengeCredits)
    ) {
        icon = Images.GIFT_ICON;
        text = false;
    }

    return (
        <TouchableWithoutFeedback
            disabled={!reward?.today}
            onPress={() => props?.onRewardPress(reward)}>
            <Animated.View
                style={[
                    {
                        marginRight: wp(2.5),
                    }
                ]}>
                <Animated.Text
                    style={{
                        opacity: animatedTitle,
                        color: Colors.White,
                        textAlign: 'center',
                        marginRight: hp(0.8),
                        marginBottom: hp(0.6),
                        fontSize: 12,
                        fontWeight: '500',
                    }}>
                    Jour {reward?.id}
                </Animated.Text>
                <View
                    style={{
                        marginRight: marginRight,
                        opacity:
                            showTitle && reward?.won
                                ? 0.5
                                : reward?.today
                                    ? 1
                                    : 0.5,
                        borderRadius: 30,
                        height: wp(15),
                        width: wp(15),
                    }}>
                    <View
                        style={styles.textView}>
                        <Image
                            source={icon}
                            resizeMode="contain"
                            style={styles.iconStyle}
                        />
                        {text && <Text style={{ color: Colors.White }}>{text}</Text>}
                    </View>
                </View>
                <Animated.Text
                    style={{
                        color: 'transparent',
                        textAlign: 'center',
                        marginRight: hp(0.8),
                        marginBottom: hp(0.6),
                        fontSize: 12,
                        fontWeight: '500',
                    }}>
                    Jour {reward?.id}
                </Animated.Text>
                {reward?.won ? (
                    <Animated.View
                        style={{
                            opacity: animatedTitle / 1.5,
                            position: 'absolute',
                            bottom: 12 + 4,
                            right: 4,
                            width: wp(7.75),
                            height: wp(7.75),
                        }}>
                        <Animated.Image
                            source={Images.GREEN_CHECK_ICON}
                            style={styles.greenCheckIcon}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        style={{
                            backgroundColor: 'transparent',
                            opacity: animatedTitle,
                            position: 'absolute',
                            bottom: 12 + 4,
                            right: 4,
                            width: wp(7.75),
                            height: wp(7.75),
                        }}
                    />
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

export default DailyRewardCard

const styles = StyleSheet.create({
    textView: {
        borderRadius: 30,
        height: wp(15),
        width: wp(15),
        backgroundColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconStyle: {
        width: wp(8.75),
        height: wp(8.75)
    },
    greenCheckIcon: {
        position: 'absolute',
        width: wp(7.75),
        height: wp(7.75),
    }
})