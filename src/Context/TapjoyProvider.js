import React, { createContext, useContext, useEffect, useState } from "react";
import { EventRegister } from 'react-native-event-listeners'
import { tapjoy } from "../Constants";

const initialState = {
    openTapjoy: '',
};

export const TapjoyContext = createContext(initialState)

export const TapjoyProvider = ({ children }) => {
    const [openTapjoy, setOpentapjoy] = useState();
    const [placementName, setPlacementName] = useState();

    useEffect(() => {
        tapjoy?._on('onPlacementDismiss', ({ placementName }) => {
            console.log(
                'placement closed from contet>>>>>',
                placementName,
                global.tapjoyType,
            );

            setPlacementName(placementName);

            if (global.tapjoyType) {
                EventRegister.emit(`TAPJOY_EVENT_${global.tapjoyType?.toUpperCase()}`, placementName)
                console.log(`TAPJOY_CLOSED_${openTapjoy?.toUpperCase()}`);
            }
        });
    }, [openTapjoy]);

    return (
        <TapjoyContext.Provider
            value={{
                openTapjoy,
                setOpentapjoy,
                placementName,
            }}>
            {children}
        </TapjoyContext.Provider>
    );
}

export const useTapjoyContext = () => useContext(TapjoyContext);