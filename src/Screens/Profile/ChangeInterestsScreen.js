import { FlatList, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../Components/ScreenWrapper';
import Text from '../../Components/Text';
import { Colors } from '../../Styles/Colors';
import { wp, hp } from '../../Helper/ResponsiveScreen';
import Loader from '../../Components/Loader';
import { PLATFORM_IOS, SCREEN_WIDTH } from '../../Constants';
import { useSelector, useDispatch } from 'react-redux'
import { fetchInterestsOptions, successMessage, updateLocalUserProfileWithDataAction } from '../../Actions';
import { apiPost } from '../../Utils/functions';
import { LMSText } from '../../Languages/LMSText';
import commonStyles from '../../Styles/index';
import _ from 'lodash';
import ProfileHeader from '../../Components/ProfileHeader';
import Lang from '../../Languages/LanguageStr';
import { useIsFocused } from '@react-navigation/native';

const ChangeInterestsScreen = (props) => {

  const [loading, setLoading] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [userInterestsData, setUserInterestsData] = useState({});
  const [userExistingInterestIds, setUserExistingInterestIds] = useState([]);

  const userReducer = useSelector((state) => state?.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchInterests();
  }, [])

  const fetchInterests = async () => {
    let userInterests = {};
    let options = userReducer?.interestsOptions;
    let userExistingInterestIds = userReducer?.userProfile?.interests.map(
      interest => interest.substring(11),
    );

    options.forEach(interest => {
      if (
        userExistingInterestIds.findIndex(
          existingInterest => existingInterest == interest.id,
        ) > -1
      ) {
        userInterests[interest.id] = interest.name;
      }
    });

    setLoadingInterests(false)
    setUserExistingInterestIds(userExistingInterestIds)
    setUserInterestsData(userInterests)
  }

  const _onSelect = (item) => {
    let userInterests = { ...userInterestsData };
    if (userInterests[item?.id] == undefined) {
      userInterests[item?.id] = item?.name;
    } else {
      delete userInterests[item?.id];
    }
    setUserInterestsData(userInterests)
  };

  const _updatePref = async () => {
    setLoading(true)
    if (_.size(userInterestsData) > 2) {
      let interestsArr = [];
      _.forEach(userInterestsData, (interestsId, index) => {
        interestsArr.push(index);
      });

      let data = {
        user: userReducer?.userProfile?.id,
        interests: interestsArr,
      };
      let res = await apiPost('/users/interest', data);
      setLoading(false)
      if (res && res?.data) {
        await dispatch(updateLocalUserProfileWithDataAction(res?.data))
        successMessage(LMSText(Lang.user.interestsUpdatedSuccessfully));
        props.navigation.goBack();
      }
    }
  };

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <View style={{ marginHorizontal: wp(5) }}>
        <ProfileHeader
          backDisabled={loading}
          checkDisabled={loading}
          loading={loading}
          title={`CENTRES D'INTÉRÊT`}
          checkPress={() => _updatePref()}
        />
        {loadingInterests ? (
          <Loader />
        ) : (
            <>
              <Text
                style={{
                  marginVertical: hp(1),
                  fontSize: PLATFORM_IOS ? 14 : 12,
                  textAlign: 'center',
                  color: Colors.Black
                }}>
                {`Sélectionnez vos centres d'intérêt`}
              </Text>
              <FlatList
                numColumns={2}
                data={userReducer?.interestsOptions || []}
                renderItem={({ item }) => {
                  return (
                    <Option
                      item={item}
                      isSelected={
                        userInterestsData[item?.id] != undefined
                          ? userInterestsData[item?.id]
                          : false
                      }
                      onSelect={() => _onSelect(item)}
                      disabled={
                        userExistingInterestIds.findIndex(
                          existingInterest => existingInterest == item.id,
                        ) > -1
                      }
                    />
                  );
                }}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingTop: hp(1) }}
                showsVerticalScrollIndicator={false}
              />
          </>
        )}
      </View>
    </ScreenWrapper>
  )
}

export default ChangeInterestsScreen



const Option = ({ item, isSelected, onSelect, disabled }) => {
  return (
    <TouchableWithoutFeedback
      disabled={disabled}
      onPress={() => onSelect(item)}>
      <View
        style={{
          margin: wp(2.5),
          backgroundColor: isSelected
            ? disabled
              ? 'rgb(170,200,230)'
              : Colors.FONT_BLUE_COLOR
            : Colors.White,
          width: SCREEN_WIDTH / 2 - wp(10),
          height: hp(5),
          borderRadius: wp(20),
          borderWidth: 2,
          borderColor: Colors.FONT_BLUE_COLOR,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ color: isSelected ? Colors.White : Colors.FONT_BLUE_COLOR }}>
          {item.name}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
