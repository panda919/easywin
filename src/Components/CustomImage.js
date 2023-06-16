import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import Loader from './Loader';
import FastImage from 'react-native-fast-image';
import { Images } from '../Utils/images';
import { wp } from '../Helper/ResponsiveScreen';

const CustomImage = (props) => {
  const [loading, setLoading] = useState(true)
  const [height, setHeight] = useState(wp(100))
  const [width, setWidth] = useState(wp(100))

  const source = props?.source && props?.source?.uri ?
    {
      ...props?.source,
      cache: props?.cacheOnly
        ? FastImage?.cacheControl?.cacheOnly
        : FastImage?.cacheControl?.immutable,
    }
    : props?.source && typeof props?.source === 'number'
      ? props?.source
      : { uri: 'https://unavailable' }
  const [imageSource, setImageSource] = useState(source)

  useEffect(() => {
    if (props?.source) {
      setLoading(false)
      setImageSource(
        props?.source && props?.source?.uri
          ? {
            ...props?.source,
            cache: props?.cacheOnly
              ? FastImage?.cacheControl?.cacheOnly
              : FastImage?.cacheControl?.immutable,
          }
          : props?.source && typeof props?.source === 'number'
            ? props?.source
            : { uri: 'https://unavailable' })
    }
  }, [props.source])

  return (
    <FastImage
      style={{
        width,
        height,
        borderRadius: 10,
        overflow: 'hidden',
        ...props?.style,
      }}
      source={imageSource || Images.DEFAULT_SOURCE}
      defaultSource={
        props?.noDefaultSource
          ? null
          : props?.defaultSource || Images.DEFAULT_SOURCE
      }
      onLoadEnd={() => setLoading(false)}
      onError={({ nativeEvent: { error } }) => {
        if (props?.backupSource && props?.backupSource?.uri) {
          setImageSource(...props?.backupSource)
        } else {
          setLoading(false)
        }
      }}
      resizeMode={
        props?.imageStyle && props?.imageStyle?.resizeMode
          ? props?.imageStyle?.resizeMode
          : 'cover'
      }
      imageStyle={{
        width,
        height,
        borderRadius: 10,
        ...props?.imageStyle,
      }}>
      {loading && (
        <View
          style={styles.loadingContent}>
          <ImageBackground
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 10,
              overflow: 'hidden',
              ...props?.style,
            }}
            imageStyle={{
              resizeMode: 'cover',
              width: '100%',
              height: '100%',
              borderRadius: 10,
              ...props?.imageStyle,
            }}
            source={Images.DEFAULT_SOURCE}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Loader />
            </View>
          </ImageBackground>
        </View>
      )}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          ...props?.contentContainerStyle,
        }}>
        {props.children}
      </View>
    </FastImage>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default CustomImage