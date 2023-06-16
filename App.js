import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import Routes from './src/Navigation/Routes';
import store from './src/Store';
import { AppState, StatusBar, Text } from 'react-native'
import { warmupLanguages } from './src/Languages/LMSText';
import ParentWrapper from './src/Components/ParentWrapper';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import ImmersiveMode from 'react-native-immersive-mode';
import { PLATFORM_IOS, REDUX_STORE_VERSION, TAPJOY_CONFIG, setupTapJoy, tapjoy } from './src/Constants';
import AsyncStorage from '@react-native-community/async-storage';
import { AppContext, AppProvider } from './src/Context/AppProvider';
import { useTapjoy } from 'react-native-tapjoy';

let persist = null;

const App = () => {
  const [reHydrated, setReHydrated] = useState(false)
  const [{ tapjoyEvents }, { initialiseTapjoy }] = useTapjoy(TAPJOY_CONFIG);

  useEffect(() => {
    const renderContent = async () => {
      // SplashScreen.hide(); //hides the splash screen on app load.

      if (Text.defaultProps == null) {
        Text.defaultProps = {};
        Text.defaultProps.allowFontScaling = false;
      }
      warmupLanguages();
      try {
        await initialiseTapjoy();
      } catch (error) {
        console.log('error', error)
      }
      // auto login
      let currentReduxStoreVersion = await AsyncStorage.getItem(
        'CURRENT_REDUX_STORE_VERSION',
      );
      if (currentReduxStoreVersion != REDUX_STORE_VERSION) {
        persist = await persistStore(store, null).purge();
        await AsyncStorage.setItem(
          'CURRENT_REDUX_STORE_VERSION',
          REDUX_STORE_VERSION,
        );
        persist = await persistStore(store, null, async () => {
          setReHydrated(true)
        });
      } else {
        persist = await persistStore(store, null, async () => {
          setReHydrated(true)
        });
      }

      AppState.addEventListener('change', _handleAppStateChange);
    }

    renderContent()

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    }
  }, []);

  const _handleAppStateChange = nextAppState => {
    if (nextAppState === 'active' && !PLATFORM_IOS) {
      ImmersiveMode.fullLayout(true);
      ImmersiveMode.setBarMode('BottomSticky');
    }
  };

  if (!reHydrated) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppProvider>
        <AppContext.Consumer>
          {(funcs) => {
            global = { funcs };
            return (
              <PersistGate loading={null} persistor={persist}>
                <ParentWrapper>
                  <StatusBar
                    barStyle={'light-content'}
                    translucent={true}
                    backgroundColor="transparent"
                  />
                  <Routes />
                </ParentWrapper>
              </PersistGate>
            )
          }}
        </AppContext.Consumer>
      </AppProvider>
    </Provider>
  )
}


export default App;
