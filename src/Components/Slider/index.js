import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Orientation from 'react-native-orientation-locker';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../Constants';
import SliderEntry from './SliderEntry';

const Slider = (props) => {
    const _sliderRef = useRef()
    const [sliderActiveSlide, setSliderActiveSlide] = useState(0)
    const [orientation, setOrientation] = useState('PORTRAIT')

    useEffect(() => {
        Orientation.addOrientationListener(_orientationDidChange);

        return () => {
            Orientation.removeOrientationListener(_orientationDidChange);
        }
    }, [])

    const _orientationDidChange = orientation => {
        if (orientation === 'LANDSCAPE') {
            setOrientation('LANDSCAPE')
        } else {
            setOrientation('PORTRAIT')
        }
    };

    const _renderCarouselItem = ({ item, index }) => {
        return (
            <TouchableOpacity activeOpacity={1}>
                <SliderEntry
                    item={item}
                    isActive={sliderActiveSlide == index}
                    sliderLink={props?.sliderLink}
                    onRulesPress={props?.onRulesPress}
                    onPressSliderLink={props?.onPressSliderLink}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ backgroundColor: 'transparent' }}>
            <Carousel
                ref={_sliderRef}
                data={props?.data}
                renderItem={_renderCarouselItem}
                sliderWidth={
                    orientation === 'LANDSCAPE' ? SCREEN_HEIGHT : SCREEN_WIDTH
                }
                itemWidth={orientation === 'LANDSCAPE' ? SCREEN_HEIGHT : SCREEN_WIDTH}
                onSnapToItem={(index) => setSliderActiveSlide(index)}
                hasParallaxImages={false}
                firstItem={0}
                loop={false}
                inactiveSlideScale={0.8}
                inactiveSlideOpacity={0.5}
                disableIntervalMomentum={true}
            />
            <Pagination
                dotsLength={props?.data?.length}
                activeDotIndex={sliderActiveSlide}
                containerStyle={{ marginTop: -18, paddingTop: 0, paddingBottom: 12 }}
                dotColor={'white'}
                dotStyle={styles.paginationDot}
                inactiveDotColor={'gray'}
                inactiveDotOpacity={1}
                inactiveDotScale={1}
                carouselRef={_sliderRef}
            />
        </View>
    )
}

export default Slider;

const styles = StyleSheet.create({
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});