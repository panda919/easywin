import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ScreenWrapper from '../Components/ScreenWrapper';
import { hp, isX, wp } from '../Helper/ResponsiveScreen'
import Header from '../Components/Header';
import { Images } from '../Utils/images';
import SplashScreen from 'react-native-splash-screen';
import { fetchEarningsActions } from '../Actions';
import { PLATFORM_IOS, SERVER_BASE } from '../Constants';
import CustomImage from '../Components/CustomImage';
import Text from '../Components/Text';
import { CARD, Colors } from '../Styles/Colors';
import moment from 'moment';
import TabButton from '../Components/TabButton';
import commonStyles from '../Styles/index';

const tabs = [
  'CONCOURS',
  'GRATTAGE',
  'MINI-JEUX',
  // "Parrain d'or"
];

const CrownScreen = () => {
  const dispatch = useDispatch()
  const earnings = useSelector((state) => state.earningsReducer.earnings)
  const [loading, setLoading] = useState(false)
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)

  useEffect(() => {
    SplashScreen.hide();
    _handleRefresh(selectedTabIndex);
  }, [])

  const _handleRefresh = async (selectedTabIndex) => {
    setLoading(true)
    await dispatch(fetchEarningsActions(selectedTabIndex))
    setLoading(false)
  };

  const renderItem = ({ item }) => {
    const {
      firstname,
      lastname,
      username,
      avatarUrl,
    } = item.user;
    const { name, media1Url } = item.lot;
    return (
      <View
        style={[styles.cradView, {
          ...CARD
        }]}>
        <View>
          <CustomImage
            source={
              avatarUrl ? { uri: `${SERVER_BASE}${avatarUrl}` } : Images.PROFILE_ICON
            }
            style={styles.profileIconStyles}
          />
        </View>
        <View style={styles.textContent}>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: Colors.Black,
              fontSize: 16,
              fontWeight: '700'
            }}>
              {`${firstname && lastname
                ? firstname + ' ' + lastname[0].toUpperCase()
                : lastname
                  ? lastname
                  : firstname
                    ? firstname
                    : username
                }`}
            </Text>
            <Text
              style={{
                marginVertical: hp(0.4),
                color: '#506483',
                fontSize: 12,
                fontWeight: '700',
              }}>
              {name}
            </Text>
            <Text style={{
              color: '#506483',
              fontSize: 12,
              fontWeight: '500'
            }}>
              {moment(item.createdAt).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>
        <View style={{ ...CARD, padding: hp(0.1) }}>
          <Image
            source={
              item.mediaUrl
                ? { uri: `${SERVER_BASE}${item.mediaUrl}` }
                : media1Url
                  ? { uri: `${SERVER_BASE}${media1Url}` }
                  : Images.IMAGE_ICON
            }
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              width: item?.mediaUrl || media1Url ? wp(15) : wp(5.5),
              height: item?.mediaUrl || media1Url ? wp(15) : wp(5),
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <Header />
      <Image
        source={Images.REWARD_BANNER}
        style={styles.rewardBannerImg}
        resizeMode="contain"
      />

      <View
        style={styles.tabContent}>
        {tabs.map((item, index) => {
          return (
            <TabButton
              tabStyle={styles.tabButton}
              tabTitleStyle={styles.tabButtonText}
              title={item}
              isSelected={index == selectedTabIndex}
              onPress={() => {
                setSelectedTabIndex(index)
                _handleRefresh(index)
              }}
            />
          );
        })}
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={earnings}
          contentContainerStyle={styles.earningsList}
          renderItem={(item) => renderItem(item)}
          keyExtractor={item => `afkey-${item.id}`}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => _handleRefresh(selectedTabIndex)}
            />
          }
          ListEmptyComponent={
            <Text style={{
              color: Colors.Black,
              alignSelf: 'center'
            }}>
              Faites partie des premiers gagnants en jouant !
            </Text>
          }
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  rewardBannerImg: {
    width: wp(100),
    height: wp(100) * 0.33,
    marginVertical: hp(1),
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    padding: wp(1.2),
    paddingHorizontal: wp(2.5),
  },
  tabButton: {
    marginLeft: wp(2.5),
    flex: 0
  },
  earningsList: {
    paddingBottom: PLATFORM_IOS ? (isX ? hp(8) : hp(11)) : hp(8),
    marginHorizontal: wp(2.5),
  },
  cradView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  profileIconStyles: {
    height: wp(15),
    width: wp(15),
    marginRight: wp(4),
    borderRadius: 30,
  },
  textContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default CrownScreen
