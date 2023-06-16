import moment from "moment";
import React, { useEffect, useState } from "react";
import { Linking, TouchableWithoutFeedback, TouchableOpacity, View, FlatList, Image, Alert, ScrollView, StyleSheet } from 'react-native';
import { SERVER_BASE } from "../../Constants";
import { hp, isX, wp } from "../../Helper/ResponsiveScreen";
import { Colors } from "../../Styles/Colors";
import { apiPut, updateStatistics } from "../../Utils/functions";
import { Images } from "../../Utils/images";
import Loader from "../Loader";
import Text from "../Text";
import commonStyles from '../../Styles/index';
import CustomImage from "../CustomImage";
import LinearGradient from "react-native-linear-gradient";
import HTML from 'react-native-render-html';
import CountDown from "../CountDown";
import Slider from "../Slider";
import YoutubePlayer from '../YoutubePlayerSmall';

const headerImageSize = wp(12.5);

const Participer = ({
  selectedConcourLots,
  loadingLots,
  loadingMakeParticipation,
  selectedConcour,
  userProfile,
  sliderLink,
  onRulesPress,
  onPlayGame,
  onSeeAllLots,
}) => {
  const {
    statistic,
    startAt,
    endAt,
    medias,
    description,
    name,
    advertisingVideo,
    client,
    companyLogoUrl,
    companyLink,
  } = selectedConcour;
  const competitionParticipationsDetail =
    userProfile?.competitionParticipationsDetails[
      userProfile?.competitionParticipationsDetails?.findIndex(
      (competitionParticipation) =>
        competitionParticipation?.competition &&
        competitionParticipation?.competition['@id'] ==
        `/competitions/${selectedConcour?.id}`,
    )
    ];
  const [isEnded, setIsEnded] = useState(moment(endAt).isSameOrBefore(moment()));

  useEffect(() => {
    setIsEnded(moment(endAt).isSameOrBefore(moment()));
    return () => { };
  }, [endAt]);

  const disableGame = () => {
    setIsEnded(true);
  };

  const openLinking = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Can not open this URL: ${url}`);
    }
  };

  const renderselectedConcourLots = ({ item, index }) => {
    return (
      <TouchableOpacity activeOpacity={1}>
        <View
          style={[styles.concourLotsListContent, {
            ...commonStyles.SMALL_SHADOW,
          }]}>
          <TouchableOpacity
            disabled={!item?.link}
            activeOpacity={1}
            onPress={async () => {
              var res = await apiPut(
                `/competition_lots/${item?.id}`,
                { toIncrementSeeDetailLot: 1 },
              );
              Linking.openURL(item?.link);
            }}>
            <CustomImage
              source={{
                uri: `${SERVER_BASE}${item?.media1Url}`,
              }}
              style={styles.lotsListCustomImageStyle}
              imageStyle={styles.lotsListImageStyle}
            />
          </TouchableOpacity>
          <View>
            <Text
              numberOfLines={1}
              style={{
                color: Colors.Black,
                padding: wp(2),
                paddingLeft: wp(2.5),
                fontSize: 11,
                fontWeight: '700',
              }}>
              {item?.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  let advertisingVideoId = null;
  if (advertisingVideo) {
    try {
      let index = advertisingVideo?.lastIndexOf('watch?v=');
      if (index > -1) {
        advertisingVideoId = advertisingVideo?.substring(index + 8);
        index = advertisingVideoId?.lastIndexOf('&ab_channel=');
        if (index > -1) {
          advertisingVideoId = advertisingVideoId?.substring(0, index);
        }
      }
    } catch (error) {
      console.log('advertisingVideo link parse error', error);
    }
  }

  return (
    <View
      style={styles.mainContent}>
      <Slider
        data={medias}
        sliderLink={sliderLink}
        onPressSliderLink={() => {
          if (statistic && statistic?.id) {
            updateStatistics(statistic?.id, { toIncrementSeeProduct: 1 });
          }
          Linking.openURL(sliderLink);
        }}
        onRulesPress={onRulesPress}
      />
      <View
        style={styles.scrollContent}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainerStyle}>
          <TouchableWithoutFeedback>
            <View>
              <View style={styles.companyContent}>
                <Text
                  style={{
                    color: Colors.Black,
                    fontSize: 24,
                    fontWeight: '700'
                  }}>
                  {name}
                </Text>
                <TouchableOpacity
                  disabled={!companyLink}
                  onPress={() => {
                    if (companyLink) {
                      openLinking(companyLink);
                    }
                  }}>
                  <View
                    style={styles.companyLogoContent}>
                    <View style={{ justifyContent: 'flex-end' }}>
                      {(client || companyLogoUrl) && (
                        <Text style={{
                          color: Colors.DARK_BLUE,
                          fontSize: 10,
                          fontWeight: '500',
                          textAlign: 'right',
                        }}>
                          ORGANISÉ PAR
                        </Text>
                      )}
                      {client && (
                        <Text style={{
                          color: Colors.DARK_BLUE,
                          fontSize: 12,
                          fontWeight: '700'
                        }}>
                          {client?.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    {companyLogoUrl && (
                      <Image
                        source={{ uri: `${SERVER_BASE}${companyLogoUrl}` }}
                        resizeMode="contain"
                        style={styles.headerImageStyle}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={styles.timerBoxView}>
                <View
                  style={styles.timerSubBoxView}>
                  <Text style={{
                    color: 'rgba(2, 28, 70, 0.28)',
                    fontSize: 12,
                    fontWeight: '700',
                    marginRight: wp(5)
                  }}>
                    {isEnded ? 'TERMINÉ' : 'TIRAGE DANS'}
                  </Text>
                  {isEnded ? (
                    <Text style={{
                      color: Colors.Black,
                      fontSize: 18,
                      fontWeight: '400',
                      fontFamily: 'Montserrat-Medium',
                    }}>
                      {moment(endAt).format('DD-MM-YYYY')}
                    </Text>
                  ) : (
                    <CountDown
                      startTime={startAt}
                      endTime={endAt}
                      disableGame={disableGame}
                    />
                  )}
                </View>
                <View>
                  <HTML
                    source={{ html: description || '<div></div>' }}
                    contentWidth={wp(100) - wp(10)}
                    tagsStyles={{ div: { color: Colors.Black }}}
                    containerStyle={{
                      padding: wp(3),
                      paddingHorizontal: wp(5),
                      flex: 1
                    }}
                  />
                </View>
              </View>
              {advertisingVideo && advertisingVideoId && (
                <View style={styles.videoView}>
                  <YoutubePlayer
                    videoId={advertisingVideoId}
                    showFullScreenButton={false}
                    onError={() => { }}
                  />
                </View>
              )}
              {selectedConcourLots && selectedConcourLots?.length > 0 && (
                <View style={styles.selectedConcourLotsView}>
                  <Text style={{
                    color: Colors.Black,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    LOTS
                  </Text>
                  <TouchableOpacity onPress={onSeeAllLots}>
                    <View style={styles.seeAllLotsView}>
                      <Text style={{
                        color: Colors.LUXE_BLUE,
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        Voir tous les lots
                      </Text>
                      <Image
                        source={Images.CHEVRON_RIGHT_ICON}
                        style={styles.chevronIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
          <FlatList
            contentContainerStyle={styles.concourLotsContainerStyle}
            data={selectedConcourLots}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                {loadingLots ? (
                  <Loader
                    style={styles.lotsLoaderStyle}
                  />
                ) : (
                  <Text style={{
                    color: Colors.FONT_DISABLED_COLOR,
                    alignSelf: 'center',
                  }}>
                    Aucun lot disponible
                  </Text>
                )}
              </View>
            }
            renderItem={renderselectedConcourLots}
            keyExtractor={(item) => `lots-${item.id}`}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
        </ScrollView>

        {isEnded ? (
          <Text style={{
            color: Colors.Black,
            textAlign: 'center',
            marginVertical: hp(2),
          }}>
            Terminé
          </Text>
        ) : (
          <LinearGradient
            colors={['#FFDB0F', '#FFB406']}
            style={styles.ParticiperButton}>
            <TouchableOpacity
              disabled={loadingMakeParticipation}
              onPress={onPlayGame}>
              {loadingMakeParticipation ? (
                <Loader color={Colors.White} />
              ) : (
                <Text style={{
                  color: Colors.Black,
                  fontWeight: '700',
                  fontSize: 14,
                  padding: wp(2),
                  paddingHorizontal: wp(12.5),
                  textAlign: 'center'
                }}>
                  {`${competitionParticipationsDetail
                    ? 'AUGMENTEZ VOS CHANCES'
                    : 'PARTICIPER'
                    }`}</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        )}
        {competitionParticipationsDetail && (
          <Text style={{
            color: Colors.APP_GRAY_COLOR,
            fontWeight: '700',
            fontSize: 14,
            padding: wp(2),
            paddingHorizontal: wp(11.5),
            textAlign: 'center'
          }}>
            {competitionParticipationsDetail?.numberOfParticipations}{' '}
            {`${competitionParticipationsDetail?.numberOfParticipations < 2
              ? 'CHANCE DE GAGNER'
              : 'CHANCES DE GAGNER'
              }`}
          </Text>
        )}
      </View>
    </View>
  );
}

export default Participer

const styles = StyleSheet.create({
  concourLotsListContent: {
    marginRight: wp(2.5),
    width: wp(45),
    marginVertical: hp(0.5),
    borderRadius: 8,
  },
  headerImageStyle: {
    width: headerImageSize,
    height: headerImageSize,
    marginLeft: wp(7.5),
  },
  mainContent: {
    flex: 1,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    overflow: 'hidden',
    backgroundColor: Colors.White
  },
  scrollContent: {
    flex: 1,
    paddingBottom: isX ? hp(2) : hp(1)
  },
  scrollContainerStyle: {
    flexGrow: 1,
    alignItems: 'center'
  },
  companyContent: {
    alignItems: 'center',
    marginVertical: hp(1.6)
  },
  timerBoxView: {
    alignSelf: 'center',
    minHeight: hp(13),
    width: wp(100) - wp(15),
    borderRadius: wp(2.5),
    backgroundColor: Colors.APP_TAB_GRAY_COLOR,
    margin: wp(2.5),
  },
  timerSubBoxView: {
    borderBottomColor: Colors.DARK_GRAY,
    borderBottomWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(2.5),
    paddingHorizontal: wp(5),
  },
  companyLogoContent: {
    marginTop: hp(1.6),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    marginBottom: hp(2),
    alignItems: 'center'
  },
  selectedConcourLotsView: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginHorizontal: wp(2.5),
    paddingBottom: hp(0.5)
  },
  seeAllLotsView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chevronIcon: {
    height: wp(5),
    width: wp(5)
  },
  concourLotsContainerStyle: {
    paddingHorizontal: wp(2.5)
  },
  lotsListCustomImageStyle: {
    width: wp(45),
    height: hp(16),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lotsListImageStyle: {
    width: wp(100),
    height: wp(100),
    resizeMode: 'cover',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  emptyView: {
    marginVertical: hp(1),
    width: wp(100) - 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lotsLoaderStyle: {
    alignSelf: 'center',
    width: wp(100) - wp(15),
  },
  ParticiperButton: {
    borderRadius: 50,
    marginTop: hp(2),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(5),
  }
})