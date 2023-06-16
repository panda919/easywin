import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import ScreenWrapper from '../Components/ScreenWrapper';
import Header from '../Components/Header';
import Text from '../Components/Text';
import { COINS_MISSIONS, CREDITS_MISSIONS, PLATFORM_IOS, TICKETS_MISSIONS } from '../Constants';
import { hp, isX, wp } from '../Helper/ResponsiveScreen'
import WalletCard from '../Components/WalletCard';
import { Colors } from '../Styles/Colors';
import CountTimer from '../Components/WalletCountTimer';
import { useIsFocused } from '@react-navigation/native';
import commonStyles from '../Styles/index';

const WalletCoinsAndTickets = ({ navigation, route }) => {

  const isFocus = useIsFocused()
  const userProfile = useSelector((state) => state?.userReducer?.userProfile)

  const [loading, setLoading] = useState(false)
  const [walletType, setWalletType] = useState(route?.params?.wallet || 'credit')
  const [filteredMissions, setFilteredMissions] = useState([])

  useEffect(() => {
    if (isFocus) {
      setWalletType(route?.params?.wallet)
      _handleRefresh()
    }
  }, [isFocus, route?.params?.wallet])

  useEffect(() => {
    if (walletType) {
      setWalletType(walletType)
      setFilteredMissions([])
      _filterMissions();
    }
  }, [walletType])

  const _handleRefresh = () => {
    setLoading(true);
    _filterMissions();
    setLoading(false);
  }

  const _filterMissions = () => {
    let filteredMissions = [];
    if (walletType == 'credit') {
      filteredMissions = CREDITS_MISSIONS;
    } else if (walletType == 'tickets') {
      filteredMissions = TICKETS_MISSIONS;
    } else if (walletType == 'coins') {
      filteredMissions = COINS_MISSIONS;
    }
    setFilteredMissions(filteredMissions)
  };

  const onCountTimerPress = (type) => {
    setWalletType(type)
    _filterMissions()
  }

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <Header />
      <CountTimer
        wallet={userProfile?.wallet}
        walletType={walletType}
        onCoinPress={() => onCountTimerPress('coins')}
        onTicketPress={() => onCountTimerPress('tickets')} />

      <Text
        style={{
          textAlign: 'center',
          fontSize: 15,
          fontWeight: '600',
          marginTop: hp(2.8),
          color: Colors.Black
        }}>{`${walletType == 'credit'
          ? 'OBTENEZ PLUS DE CRÉDITS'
          : walletType == 'tickets'
            ? 'OBTENEZ PLUS DE BILLETS'
            : 'OBTENEZ PLUS DE PIÈCES'
          }`}</Text>
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredMissions}
          style={styles.filteredMissionsContent}
          renderItem={({ item, index }) => (
            <WalletCard
              name={item.name}
              description={item.description}
              onPress={
                item.navigate
                  ? () => navigation.navigate(item?.tab, {screen: item?.navigate})
                  : false
              }
            />
          )}
          contentContainerStyle={{
            paddingBottom: PLATFORM_IOS ? (isX ? hp(8) : hp(11)) : hp(8),
          }}
          keyExtractor={item => item?.name}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={_handleRefresh}
            />
          }
          ListEmptyComponent={
            <Text style={{
              color: Colors.Black,
              alignSelf: 'center',
              margin: wp(5)
            }}>
              Aucune mission disponible
            </Text>
          }
        />
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  filteredMissionsContent: {
    paddingTop: hp(1.7),
    marginTop: hp(0.7)
  },
})

export default WalletCoinsAndTickets