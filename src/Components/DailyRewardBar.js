import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Text from './Text';
import DailyRewardCard from './DailyRewardCard';
import moment from 'moment';
import {
    PLATFORM_IOS,
    STATUSBAR_HEIGHT,
} from '../Constants';
import { Images } from '../Utils/images';
import { hp, isX, wp } from '../Helper/ResponsiveScreen';
import { Colors } from '../Styles/Colors';

const DailyRewardBar = ({ rewardList, onClose, onRewardPress }) => {
    let days = 1;
    rewardList?.forEach(reward => {
        if (reward?.won) days = days - 1;
    });
    let fromDate = moment().add(days, 'd');
    let toDate = moment(fromDate).add(rewardList?.length - 1, 'd');

    return (
        <View
            style={styles.content}>
            <View
                style={styles.titleView}>
                <View>
                    <Text style={{
                        fontSize: 21,
                        fontWeight: 'bold',
                        color: Colors.White
                    }}>
                        Bonus de connexion
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        {fromDate.format('DD/MM/YYYY')} au {toDate.format('DD/MM/YYYY')}
                    </Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                    <Image source={Images.VIDEO_CROSS_ICON} style={styles.videoCrossIcon} />
                </TouchableOpacity>
            </View>
            <ScrollView
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: hp(2) }}
                contentContainerStyle={{ paddingLeft: wp(5) }}
                horizontal>
                {rewardList?.map((reward, index) => (
                    <DailyRewardCard
                        onRewardPress={onRewardPress}
                        reward={reward}
                        index={index}
                        total={rewardList?.length}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default DailyRewardBar

const styles = StyleSheet.create({
    content: {
        backgroundColor: Colors.DARK_BLUE,
        paddingTop: PLATFORM_IOS ? isX ? hp(4.8) : hp(3) : STATUSBAR_HEIGHT + hp(2.2),
        paddingBottom: hp(1.1),
    },
    titleView: {
        paddingHorizontal: wp(5),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    videoCrossIcon: {
        height: wp(10),
        width: wp(10)
    }
})