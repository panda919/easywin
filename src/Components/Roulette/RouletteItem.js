import React, { useState } from 'react'
import { View } from 'react-native'

const RouletteItem = (props) => {
    const [coordX, setCoordX] = useState(props?.radius)
    const [coordY, setCoordY] = useState(props?.radius)

    const getCoordinates = ({ width, height }) => {
        const { radius, index, step, distance } = props;

        const coordX = Math.round(
            radius / 2 + distance * -Math.sin(index * step - Math.PI) - width / 2,
        );
        const coordY = Math.round(
            radius / 2 + distance * Math.cos(index * step - Math.PI) - height / 2,
        );

        setCoordX(coordX)
        setCoordY(coordY)
    }

    return (
        <View
            style={{
                position: 'absolute',
                left: coordX,
                top: coordY,
                transform: [{ rotate: `${-props?.rouletteRotate}deg` }],
            }}
            onLayout={event => getCoordinates(event.nativeEvent.layout)}>
            {props?.item}
        </View>
    )
}

export default RouletteItem