import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Modal from "react-native-modal";
import { SCREEN_HEIGHT, SCREEN_WIDTH, SERVER_BASE } from '../../Constants';
import { hp, PLATFORM_IOS, wp } from '../../Helper/ResponsiveScreen';
import { Colors } from '../../Styles/Colors';
import CustomImage from '../CustomImage';
import Loader from '../Loader';
import Text from '../Text';
import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';
import { apiPost } from '../../Utils/functions';
import { errorMessage } from '../../Actions';
import { LMSText } from '../../Languages/LMSText';
import Lang from '../../Languages/LanguageStr';
import { RadioButton, RadioGroup } from '../RadioButton';

const SurveySheet = (props) => {
  return (
    <Modal
      isVisible={props?.isSurveySheetOpen}
      swipeDirection={'down'}
      useNativeDriverForBackdrop={true}
      statusBarTranslucent
      onSwipeComplete={props?.onClose}
      style={styles.modalView}>
      <View>
        <View style={styles.topborder} />
        <View style={styles.bottomSheetContainer}>
          {props?.survey?.imageUrl && (
            <CustomImage
              source={{ uri: `${SERVER_BASE}${props?.survey?.imageUrl}` }}
              style={styles.customImageStyle}
              contentContainerStyle={styles.customImageContainerStyle}
            />
          )}
          <View style={styles.mainContent}>
            <TouchableWithoutFeedback
              hitSlop={{ top: wp(5), left: wp(5), right: wp(5), bottom: wp(5) }}
            >
              <View
                style={styles.QuestionnaireTitleView}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: Colors.Black,
                      textAlign: 'center',
                      alignSelf: 'stretch',
                      fontFamily: 'Montserrat-Bold',
                    }}>
                      Sondage
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
            {props?.loadingSurvey || !props?.survey ? (
              <Loader />
            ) : (
              <View style={styles.questionView}>
                <TouchableWithoutFeedback>
                  <ScrollView>
                    {_.map(props?.survey?.questions, (question, index) => {
                      return (
                        <View>
                          <Text
                            style={{
                              fontWeight: '400',
                              fontFamily: 'Montserrat-Medium',
                              textDecorationLine: 'underline',
                              color: Colors.FONT_BLACK_COLOR,
                              marginBottom: hp(0.7),
                            }}>
                            {index + 1} - {question?.name}
                          </Text>
                          <RadioGroup
                            size={25}
                            style={{ marginBottom: hp(1) }}
                            activeColor={Colors.APP_GRAY_COLOR} //active circle color
                            color={Colors.APP_GRAY_COLOR} //inactive circle color
                            thickness={2}
                            onSelect={(index, value) => {
                              props?.setSurvey({
                                ...props?.survey,
                                answers: {
                                  ...props?.survey?.answers,
                                  [value.questionId]: {
                                    questionId: value?.questionId,
                                    answer: value?.objEntryValues,
                                  },
                                },
                              })
                            }}>
                            {_.map(question, (objEntryValues, objEntryKey) => {
                              if (objEntryKey.includes('option')) {
                                return (
                                  <RadioButton
                                    value={{
                                      objEntryValues,
                                      questionId: question?.id,
                                    }}
                                    color={Colors.APP_COLOR}
                                    key={objEntryKey}
                                    id={objEntryKey}
                                    style={{ alignItems: 'center' }}>
                                    <View>
                                      <Text
                                        style={{
                                          color: Colors.FONT_BLACK_COLOR,
                                          marginLeft: wp(2.5),
                                        }}>
                                        {objEntryValues}
                                      </Text>
                                    </View>
                                  </RadioButton>
                                );
                              }
                              return false;
                            })}
                          </RadioGroup>
                        </View>
                      );
                    })}
                  </ScrollView>
                </TouchableWithoutFeedback>
                <LinearGradient
                  colors={['#FFDB0F', '#FFB406']}
                  style={styles.linearStyle}>
                  <TouchableOpacity
                    onPress={async () => {
                      let allAnswered =
                        props?.survey?.questions?.length == _?.size(props?.survey?.answers);
                      if (allAnswered) {
                        props?.setSavingSurvey(true)
                        let res = await apiPost(
                          `/answers/${props?.survey?.id}`,
                          _?.map(props?.survey?.answers, (ansObj) => ansObj),
                        );
                        if (res && res?.data) {
                          props?._updatecompetitionParticipationsDetail({
                            survey: true,
                          });
                          props?.setSavingSurvey(false)
                          // survey sheet close
                          props?.onClose()
                        }
                      } else {
                        errorMessage(LMSText(Lang.Concours.giveAllAnswers));
                      }
                    }}>
                    {props?.savingSurvey ? (
                      <Loader
                        style={{ paddingHorizontal: wp(2.5), paddingVertical: hp(0.5) }}
                      />
                    ) : (
                      <Text
                        style={{
                          color: Colors.Black,
                          fontWeight: '700',
                          fontSize: 14,
                          padding: hp(0.7),
                          paddingHorizontal: wp(12.5),
                          textAlign: 'center',
                        }}>
                        SOUMETTRE
                      </Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default SurveySheet

const styles = StyleSheet.create({
  modalView: {
    justifyContent: 'flex-end',
    margin: 0
  },
  topborder: {
    backgroundColor: Colors.Gray2,
    height: hp(1),
    alignSelf: "center",
    width: wp(15),
    borderRadius: wp(10),
    marginBottom: hp(1)
  },
  bottomSheetContainer: {
    height: PLATFORM_IOS ? SCREEN_HEIGHT - hp(14) : SCREEN_HEIGHT - hp(9),
    width: wp(100),
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: Colors.White,
    overflow: 'hidden'
  },
  customImageStyle: {
    overflow: 'hidden',
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.387,
    borderRadius: 0,
  },
  customImageContainerStyle: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  mainContent: {
    flex: 1,
    padding: wp(5)
  },
  QuestionnaireTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  questionView: {
    flex: 1,
    justifyContent: 'space-between'
  },
  linearStyle: {
    borderRadius: 50,
    marginTop: hp(2),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(4.8),
  }
})