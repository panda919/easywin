import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Modal from "react-native-modal";
import commonStyles from '../Styles/index';
import { Colors } from '../Styles/Colors';
import { hp, wp } from '../Helper/ResponsiveScreen';
import { useSelector, useDispatch } from 'react-redux'
import { fetchCitiesActions, fetchMoreCitiesActions } from '../Actions';
import Loader from './Loader';
import Text from './Text';
import TextInput from './TextInput';


let searchTimeout = null;

const CitySheet = ({
  isVisible,
  onSwipeComplete,
  onCitySelect,
  colseModal,
  swipeDirection
}) => {

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const cities = useSelector((state) => state?.citiesReducer);

  useEffect(() => {
    async function cityApiCall() {
      await dispatch(fetchCitiesActions());
      await dispatch(fetchMoreCitiesActions());
    };
    cityApiCall();
  }, [])

  useEffect(() => {
    _handleRefresh();
  }, [])


  const _handleRefresh = async (searchTerm) => {
    setLoading(true);
    await dispatch(fetchCitiesActions(searchTerm));
    setLoading(false)
  };

  const renderItem = ({ item, index }) => {
    const { name, postalCode } = item;
    return (
      <Pressable onPress={() => onCitySelect(item)}>
        <View style={{ marginTop: hp(2), marginHorizontal: wp(5) }}>
          <Text style={{ color: Colors.Black }}>
            {name} {postalCode && postalCode[0] ? '- ' + postalCode[0] : ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      swipeDirection={swipeDirection}
      useNativeDriverForBackdrop={true}
      onSwipeComplete={onSwipeComplete}
      statusBarTranslucent
      style={commonStyles.modalView}>
      <View>
        <Pressable onPress={colseModal}>
          <View style={commonStyles.topborder} />
        </Pressable>
        <View
          style={{
            height: hp(80),
            width: wp(100),
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: Colors.White,
            alignItems: 'center',
          }}>
          <View>
            <Text
              style={{
                color: Colors.Black,
                fontSize: 22,
                fontWeight: '700',
                marginTop: hp(4),
              }}>
              Sélectionnez une ville
            </Text>
            <TextInput
              placeholder="Rechercher"
              style={{
                borderColor: Colors.APP_BORDER_GRAY_COLOR,
                borderWidth: 1,
                width: wp(90),
                marginTop: hp(2)
              }}
              textInputStyle={{ width: wp(100) }}
              onChangeText={searchTerm => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                  _handleRefresh(searchTerm);
                }, 1000);
              }}
            />
            <FlatList
              data={cities?.cities}
              contentContainerStyle={{ paddingBottom: hp(5) }}
              renderItem={renderItem}
              keyExtractor={item => `city-${item.id}`}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.1}
              onEndReached={async () => {
                if (cities?.nextPage) {
                  await dispatch(fetchMoreCitiesActions());
                }
              }}
              ListFooterComponent={
                cities?.nextPage && <Loader style={{ alignSelf: 'center' }} />
              }
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={() => _handleRefresh()}
                />
              }
              ListEmptyComponent={
                !loading && (
                  <Text
                    style={{ color: Colors.Black, alignSelf: 'center', margin: 20 }}>
                    Aucun résultat
                  </Text>
                )
              }
              style={{ alignSelf: 'stretch', flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default CitySheet;