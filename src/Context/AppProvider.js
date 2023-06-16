import React, { createContext, useContext, useState } from 'react';
import { TapjoyProvider } from './TapjoyProvider';

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  const [bottomtab, setBottomtab] = useState(true)

  const globalFunc = {
    ShowTab: () => setBottomtab(true),
    HideTab: () => setBottomtab(false),
  };

  return (
    <AppContext.Provider value={{ ...globalFunc, bottomtab }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

// create the consumer as higher order component
export const withAppContext = (ChildComponent) => (props) => (
  <AppContext.Consumer>
    {(context) => (
      <TapjoyProvider {...props}>
        <ChildComponent {...props} global={context} />
      </TapjoyProvider>
    )}
  </AppContext.Consumer>
);