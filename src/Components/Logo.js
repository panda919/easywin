import React from 'react';
import { Image } from 'react-native';
import { Images } from '../Utils/images';

const Logo = ({ style }) => {
  return (
    <Image
      source={Images.logo}
      style={{ width: 192, height: 109, ...style }}
      resizeMode="contain"
    />
  )
}

export default Logo
