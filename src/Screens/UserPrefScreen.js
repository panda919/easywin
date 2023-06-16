import React, { useEffect, useRef, useState } from 'react';
import { TouchableWithoutFeedback, View, FlatList, StyleSheet } from 'react-native';
import {
  errorMessage,
  updateLocalUserProfileWithDataAction,
  fetchInterestsOptions
} from '../Actions';
import SplashScreen from 'react-native-splash-screen';
import {
  apiPost,
  hideBottomBar,
} from '../Utils/functions';
import { LMSText } from '../Languages/LMSText';
import { PLATFORM_IOS } from '../Constants';
import { Colors } from '../Styles/Colors';
import { useDispatch } from "react-redux";
import _ from 'lodash';
import ScreenWrapper from '../Components/ScreenWrapper';
import Logo from '../Components/Logo';
import Text from '../Components/Text';
import LoadingButton from '../Components/LoadingButton';
import { hp, wp } from '../Helper/ResponsiveScreen';
import Lang from '../Languages/LanguageStr';
import { useSelector } from 'react-redux';

const Option = ({ item, isSelected, onSelect }) => {
  return (
    <TouchableWithoutFeedback onPress={() => onSelect(item)}>
      <View
        style={{
          margin: wp(2.5),
          backgroundColor: isSelected ? Colors.White : 'transparent',
          width: wp(100) / 2 - 50,
          height: hp(4.4),
          borderRadius: 19,
          borderWidth: 2,
          borderColor: Colors.White,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ color: isSelected ? Colors.FONT_BLUE_COLOR : Colors.White, fontSize: 15 }}>
          {item.name.toUpperCase()}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const UserPrefScreen = (props) => {

  const dispatch = useDispatch();
  const _updatePrefButton = useRef()

  const userReducer = useSelector(state => state?.userReducer);
  const [loading, setLoading] = useState(true)
  const [userInterests, setUserInterests] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      SplashScreen.hide();
      hideBottomBar();
      await dispatch(fetchInterestsOptions());
      setLoading(false)
    }
    fetchData()
    return () => {
      hideBottomBar();
    }
  }, [])

  const _onSelect = item => {
    if (userInterests[item.id] == undefined) {
      userInterests[item.id] = item.name;
    } else {
      delete userInterests[item.id];
    }
    setUserInterests({ ...userInterests })
  };

  const _updatePref = async () => {
    _updatePrefButton?.current?.showLoading();
    if (_.size(userInterests) > 2) {
      let interestsArr = [];
      _.forEach(userInterests, (interest, interestsId) => {
        interestsArr.push(interestsId);
      });

      let data = {
        user: userReducer?.userProfile?.id,
        interests: interestsArr,
      };
      let res = await apiPost('/users/interest', data);
      _updatePrefButton?.current?.hideLoading();
      if (res && res.data) {
        dispatch(updateLocalUserProfileWithDataAction(res.data));
        props.navigation.navigate('Home');
      }
    } else {
      errorMessage(LMSText(Lang.userPref.selectAtleastMinimumOptions));
      _updatePrefButton?.current?.hideLoading();
    }
  };

  return (
    <ScreenWrapper
      withBg
      contentContainerStyle={styles.screenWrapperContent}>
      <View style={styles.content}>
        <Logo />
        <Text style={{
          marginBottom: hp(2.5),
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center'
        }}>{`Une expérience\nde jeu sur-mesure !`}</Text>
        <Text
          style={{
            marginBottom: hp(2.5),
            fontSize: PLATFORM_IOS ? 14 : 12,
            textAlign: 'center',
          }}>
          Sélectionnez vos centres d'intéret (3 minimum)
        </Text>
        <FlatList
          numColumns={2}
          data={userReducer?.interestsOptions || []}
          renderItem={({ item }) => {
            return (
              <Option
                item={item}
                isSelected={
                  userInterests[item.id] != undefined
                    ? userInterests[item.id]
                    : false
                }
                onSelect={_onSelect}
              />
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: hp(2.5) }}
          style={{ marginHorizontal: wp(5) }}
          showsVerticalScrollIndicator={false}
        />
        <LoadingButton
          ref={_updatePrefButton}
          disabled={loading}
          style={styles.updatePrefButton}
          onPress={() => _updatePref()}
          titleStyle={{ color: Colors.FONT_BLUE_COLOR }}
          title={'VALIDER'}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screenWrapperContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatePrefButton: {
    marginTop: hp(3.5),
    marginBottom: PLATFORM_IOS ? hp(3.5) : hp(7.8),
  },
  content: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10)
  }
})


export default UserPrefScreen;
