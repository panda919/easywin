import { Dimensions, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

const InViewPort = (props) => {
    const [rectTop, setReactTop] = useState(0);
    const [rectBottom, setRectBottom] = useState(0);
    const [rectWidth, setRectWidth] = useState(0);
    const myview = useRef(null);
    const lastValue = useRef(null);
    const interval = useRef(null);

    useEffect(() => {
        interval.current = null
        if (props?.disabled) {
            stopWatching();
        } else {
            startWatching();
        }

        return () => {
            stopWatching();
        };
    }, [props?.disabled, props?.delay, props?.onChange, rectTop, rectBottom, rectWidth])


    const startWatching = () => {
        if (interval?.current) {
            return;
        }
        interval.current = setInterval(() => {
            if (!myview?.current) {
                return;
            }
            myview?.current?.measure((x, y, width, height, pageX, pageY) => {
                setReactTop(pageY);
                setRectBottom(pageY + height);
                setRectWidth(pageX + width);
            });
            isInViewPort();
        }, props.delay || 100);
    }

    const stopWatching = () => {
        interval.current = clearInterval(interval?.current);
    }

    const isInViewPort = () => {
        const window = Dimensions.get('screen');
        const isVisible =
            rectBottom != 0 &&
            rectTop >= 0 &&
            rectBottom <= window.height &&
            rectWidth > 0 &&
            rectWidth <= window.width;
        if (lastValue.current !== isVisible) {
            lastValue.current = isVisible;
            props?.onChange(isVisible);
        }
    }

    return (
        <View
            collapsable={false}
            ref={myview}
            {...props}>
            {props.children}
        </View>
    )
}

export default InViewPort