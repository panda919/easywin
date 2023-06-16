import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Colors } from '../Styles/Colors';

export default (Loader = props => (
  <ActivityIndicator
    size={props.size || 'small'}
    style={[{ padding: 1 }, props.style]}
    color={props.color || Colors.APP_LOADER_COLOR}
  />
));
