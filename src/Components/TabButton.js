import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { wp } from '../Helper/ResponsiveScreen';
import { Colors } from '../Styles/Colors';
import Text from './Text';

export default (TabButton = ({
  onPress,
  title,
  isSelected,
  tabStyle,
  tabTitleStyle,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          backgroundColor: isSelected ? Colors.APP_COLOR : Colors.APP_TAB_GRAY_COLOR,
          borderRadius: wp(32),
          ...tabStyle,
        }}>
        <Text
          style={{
            padding: wp(1.5),
            fontSize: 13,
            fontWeight: '700',
            color: isSelected ? 'white' : Colors.PLACEHOLDER_COLOR,
            ...tabTitleStyle,
          }}>
          {title}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
});
