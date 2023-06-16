import { View, TouchableOpacity, Image, StyleSheet, SectionList, FlatList, ActivityIndicator, Pressable } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../Components/ScreenWrapper'
import { PLATFORM_ANDROID, hp, wp } from '../../Helper/ResponsiveScreen'
import { Images } from '../../Utils/images'
import { CARD, Colors } from '../../Styles/Colors'
import CustomImage from '../../Components/CustomImage'
import { useSelector, useDispatch } from 'react-redux'
import ProgressBar from 'react-native-progress/Bar';
import TabButton from '../../Components/TabButton'
import Mission from '../../Components/Mission'
import {
  fetchUserProfileAction,
  fetchMissionsAction,
  showPopup,
  fetchUsersEarningsActions,
  fetchMoreUsersEarningsActions,
  clearMission
} from '../../Actions'
import { apiGet, apiPostImage } from '../../Utils/functions'
import ShareCodeSheet from '../../Components/ShareCodeSheet'
import LinearGradient from 'react-native-linear-gradient'
import { getCameraGalleryPermissions, permissionsAlert, pickFromGallery } from '../../Utils/camera'
import PopupBase from '../../Components/PopupBase'
import ActionSheet from 'react-native-actionsheet';
import MesGainsItem from '../../Components/MesGains/MesGainsItem'
import ParrainageItem from '../../Components/Parrainage/ParrainageItem'
import commonStyles from '../../Styles/index';
import { SERVER_BASE } from '../../Constants'
import RNFS from 'react-native-fs';
import { readFile } from '../../Utils/file-storage'
import CameraModel from '../../Components/Camera/CameraModel'
import { useCameraDevices } from 'react-native-vision-camera'
import { useIsFocused } from '@react-navigation/native'

const tabs = ['MISSIONS', 'PARRAINAGE', 'MES GAINS'];

const ProfileScreen = (props) => {

  const userProfile = useSelector((state) => state.userReducer?.userProfile);
  const missions = useSelector((state) => state?.missionsReducer);
  const bottomSheetCount = useSelector((state) => state.tabbarReducer?.bottomSheetCount);
  const myEarnings = useSelector((state) => state.earningsReducer?.myEarnings);
  const nextPage = useSelector((state) => state.earningsReducer?.nextPage);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [sponsored_list, setSponsored_List] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEarningId, setSelectedEarningId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching_from_server, setFetching_From_Server] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl ?? '');
  const [localImage, setLocalImage] = useState(false)
  const [isShow, setIsShow] = useState(false)
  const dispatch = useDispatch();
  const actionSheetRef = useRef();
  const devices = useCameraDevices();
  const device = devices['back'];
  const camera = useRef()
  const isFocused = useIsFocused();

  let offset = 0;
  let imgSrc = Images.PROFILE_ICON;
  if (avatarUrl) {
    imgSrc = { uri: `${SERVER_BASE}${avatarUrl}` };
  } else if (userProfile?.ssoProfileAvatar) {
    imgSrc = { uri: userProfile?.ssoProfileAvatar };
  }

  useEffect(() => {
    dispatch(clearMission())
    dispatch(fetchUserProfileAction())
    dispatch(fetchMissionsAction())
  }, [isFocused])

  useEffect(() => {
    apiCall();
  }, [isFocused])

  const apiCall = async () => {
    if (__DEV__) {
      let mesRes = await dispatch(fetchUsersEarningsActions());
      if (mesRes) {
        offset = offset + 1;
      }
      let res = await apiGet('/users/sponsored_list');
      if (res && res.data && res.data['hydra:member'].length != undefined) {
        setSponsored_List(res.data['hydra:member']);
      }
    } else {
      await dispatch(fetchUsersEarningsActions());
      let res = await apiGet('/users/sponsored_list');
      if (res && res.data && res.data['hydra:member'].length != undefined) {
        setSponsored_List(res.data['hydra:member']);
      }
    }
  }

  const _pickFromGallery = async () => {
    let localImage = await pickFromGallery();
    if (localImage) {
      setLocalImage(localImage)
      uploadImageAsync(localImage);
    }
  };

  const _pickFromCamera = async () => {
    let havePermission = await getCameraGalleryPermissions();
    if (!havePermission) {
      permissionsAlert();
      return false;
    } else {
      setIsShow(true)
    }
  };

  const uploadImageAsync = async (localImage) => {
    let data = new FormData();
    data.append('file', {
      name: `rnd-${localImage?.filename ? localImage?.filename : 'profileimg'
        }.jpg`,
      type: 'image/jpeg',
      uri: localImage.path,
    });
    let res = await apiPostImage(`/competition_earnings/media/${selectedEarningId}`, data);

    if (res && res.data) {
      showPopup(
        <PopupBase
          title={'Photo envoyée avec succès'}
          buttonTitle={'OK'}
          imgSrc={Images.SUCCESS_CHECK_ICON}
          onButtonPress={async () => { }}
          onClose={async () => { }}>
          <Text
            style={{
              color: 'black',
              fontSize: 14,
              fontWeight: '400',
              textAlign: 'center',
            }}>
            {`Vous recevrez votre récompense\naprès validation de votre photo`}
          </Text>
        </PopupBase>,
      );
      await dispatch(fetchUsersEarningsActions())
    }
    return res;
  };

  const loadMoreData = async () => {
    //On click of Load More button We will call the web API again
    if (nextPage) {
      setFetching_From_Server(true)
      const Res = await dispatch(fetchMoreUsersEarningsActions());
      if (Res) {
        offset = offset + 1;
      }
    } else {
      setFetching_From_Server(false)
    }
  };


  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View
        style={{
          padding: wp(10),
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {fetching_from_server ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => loadMoreData()}
            //On Click of button calling loadMoreData function to load more data
            style={{
              padding: 10,
              backgroundColor: Colors.APP_BLUE_COLOR,
              borderRadius: 4,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: Colors.White, fontSize: 15, textAlign: 'center' }}>
              CHARGEMENT
            </Text>
            {fetching_from_server ? (
              <ActivityIndicator color={Colors.White} style={{ marginLeft: 8 }} />
            ) : null}
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    return (
      <MesGainsItem
        userProfile={userProfile}
        item={item}
        openCameraOnPress={() => {
          setSelectedEarningId(item.id);
          actionSheetRef?.current?.show();
        }} />
    );
  }

  const _tabRenderSelection = () => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <Loader />
        </View>
      );
    } else {
      switch (selectedTabIndex) {
        case 0:
          return _renderMissionsTab();
        case 1:
          return _renderParrainageTab();
        case 2:
          return _renderMesgainsTab();
      }
    }
  };
  const _renderMissionsTab = () => {
    if (missions?.missions?.length) {
      return (
        <View style={{
          borderWidth: 1,
          borderColor: Colors.APP_TAB_GRAY_COLOR,
          borderRadius: 15,
          marginBottom: hp(11.5)
        }}>
          <SectionList
            stickySectionHeadersEnabled={true}
            contentContainerStyle={{ paddingBottom: hp(8) }}
            sections={missions?.missions}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <Mission
                mission={item}
                xp={userProfile?.xp}
                userProfile={userProfile}
              />
            )}
            renderSectionHeader={({ section: { title, icon } }) => (
              <View style={styles.missionHeader}>
                <Image
                  source={icon}
                  style={styles.missionHeaderIcons}
                  resizeMode={'contain'}
                />
                <Text style={{
                  color: Colors.PLACEHOLDER_COLOR,
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>{title}</Text>
              </View>
            )}
          />
        </View>
      );
    }
    return null;
  };

  const _renderParrainageTab = () => {
    return (
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#506483' }}>
          Mes filleuls
        </Text>
        <FlatList
          data={sponsored_list}
          renderItem={({ item }) => {
            return (<ParrainageItem item={item} />);
          }}
          keyExtractor={(item) => `spokey-${item.id}`}
          ListEmptyComponent={
            <Text style={{
              textAlign: 'center',
              color: Colors.FONT_DISABLED_COLOR
            }}>
              {`Vous n'avez pas encore de filleuls.\nInvitez vos amis sur EasyWin\net obtenez des récompenses.`}
            </Text>
          }
        />
        {bottomSheetCount < 1 && (
          <LinearGradient
            colors={[Colors.LIGHT_YELLOW, Colors.YELLOW]}
            style={{ borderRadius: 50, alignSelf: 'center', marginBottom: hp(2) }}>
            <Pressable
              onPress={() => setIsOpen(true)}>
              <Text
                style={{
                  color: Colors.Black,
                  fontWeight: 'bold',
                  fontSize: 15,
                  padding: wp(2),
                  paddingHorizontal: wp(4),
                }}>
                  INVITER VOS AMIS : {userProfile?.sponsorCode}
              </Text>
            </Pressable>
          </LinearGradient>
        )}
      </View>
    );
  }

  const _renderMesgainsTab = () => {
    if (myEarnings?.length) {
      return (
        <View>
          <View style={{
            flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingBottom: hp(2)
          }}>
            <Text
              style={{
                color: Colors.DARK_GRAY,
                fontSize: 14,
                fontWeight: '700',

              }}>
              {`Envoyez une photo de votre lot et recevez 100 `}
              <Image
                source={Images.COIN_ICON}
                style={{ width: wp(4), height: wp(4) }}
              />
            </Text>
          </View>
          <FlatList
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(10) }}
            extraData={myEarnings}
            keyExtractor={(item, index) => `mes_${index}`}
            data={myEarnings}
            onEndReached={() => loadMoreData()}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            renderItem={renderItem}
          />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: Colors.FONT_DISABLED_COLOR }}>
          Vous n'avez pas encore gagné de lots.
        </Text>
      </View>
    );
  }

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');
      const localImage = await camera.current.takePhoto({
        photoCodec: 'jpeg',
        qualityPrioritization: 'speed',
        quality: 100,
        skipMetadata: true
      });
      const data = await readFile(localImage?.path)
      const fullPath = RNFS.DocumentDirectoryPath + localImage?.path;
      const fullPathPrefixed = PLATFORM_ANDROID ? 'file://' + fullPath : fullPath;
      setLocalImage({
        data: data,
        width: localImage.width,
        height: localImage.height,
        mime: "image/jpeg",
        path: fullPathPrefixed
      })
      uploadImageAsync({
        data: data,
        width: localImage.width,
        height: localImage.height,
        mime: "image/jpeg",
        path: fullPathPrefixed
      });
      setIsShow(false)
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  }, [camera]);

  return (
    <ScreenWrapper contentContainerStyle={commonStyles.screenWrapperContent}>
      <View style={styles.Header}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image
              source={Images.BACK_ICON}
              style={styles.icons}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: wp(9),
              height: wp(9),
              backgroundColor: '#D7D7D7',
              borderRadius: wp(9),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              if (userProfile?.level) {
                props.navigation.navigate('ProfileEditScreen')
              }
            }
            }>
            <Image source={Images.SETTING_ICON} style={{ tintColor: '#3B4E67', height: wp(5), width: wp(5) }} />
          </TouchableOpacity>
        </View>
        <CustomImage source={imgSrc} style={styles.profileIcon} />
        <View style={styles.userDetailView}>
          <Text style={{ color: Colors.Black, fontSize: 18, fontWeight: 'bold' }}>
          {userProfile?.firstname} {userProfile?.lastname}
          </Text>
          <Text
            style={{
              color: Colors.APP_LIGHT_BLUE_COLOR,
              fontSize: 18,
              fontWeight: '700',
            }}>
            {userProfile?.xp?.total} XP
          </Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            color: Colors.DARK_GRAY
          }}>
            Niv. {userProfile?.level}
          </Text>
          <ProgressBar
            progress={((userProfile?.xp?.total - 1000 * (userProfile?.level - 1)) / 1000) || 0}
            width={wp(60)}
            borderWidth={0}
            color={Colors.APP_LIGHT_BLUE_COLOR}
            unfilledColor={Colors.APP_TAB_GRAY_COLOR}
            height={8}
          />
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            color: Colors.LIGHT_GREEN
          }}>
            Niv. {userProfile?.level + 1}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.tabView}>
            {tabs.map((title, index) => (
              <TabButton
                title={title}
                isSelected={index === selectedTabIndex}
                onPress={() => setSelectedTabIndex(index)}
              />
            ))}
          </View>
          {_tabRenderSelection()}
        </View>
      </View>
      <ShareCodeSheet
        isVisible={isOpen}
        message={`Gagnez des cadeaux chaque jour en jouant GRATUITEMENT à des jeux ! Télécharge EasyWin avec mon code de parrainage pour obtenir un bonus.\n➡️ Lien d'EasyWin : www.easy-win.io\n➡️ Mon code : ${userProfile?.sponsorCode}`}
        onSwipeComplete={() => setIsOpen(false)}
        closeModal={() => setIsOpen(false)}
      />
      <ActionSheet
        ref={actionSheetRef}
        title={'veuillez sélectionner une option'}
        options={['Galerie', 'Appareil photo', 'Annuler']}
        cancelButtonIndex={2}
        onPress={(index) => {
          index == 0
            ? _pickFromGallery()
            : index == 1
              ? _pickFromCamera()
              : null;
        }}
      />

      {/* open camera view  */}
      {isShow &&
        <CameraModel
          isShow={isShow}
          onClose={() => setIsShow(false)}
          camera={camera}
          takePhoto={takePhoto}
          device={device}
        />
      }
    </ScreenWrapper>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  screenWrapperContent: {
    backgroundColor: Colors.White
  },
  Header: {
    flex: 1,
    marginHorizontal: wp(5)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icons: {
    alignSelf: 'flex-end',
    width: wp(9),
    height: wp(9),
  },
  profileIcon: {
    alignSelf: 'center',
    width: wp(22),
    height: wp(22),
    borderRadius: wp(50),
    overflow: 'hidden',
  },
  userDetailView: {
    alignItems: 'center',
    marginVertical: hp(2)
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.DARK_GRAY
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(5),
    marginBottom: hp(2),
    backgroundColor: Colors.APP_TAB_GRAY_COLOR,
    borderRadius: wp(32),
  },
  missionHeader: {
    ...CARD,
    marginBottom: hp(2),
    borderRadius: 15,
    padding: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.APP_TAB_GRAY_COLOR,
  },
  missionHeaderIcons: {
    width: wp(10),
    height: wp(8),
    marginRight: wp(5)
  }
})
