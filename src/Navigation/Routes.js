import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setTopLevelNavigation } from '../Helper/NavigationHelper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SigninScreen from '../Screens/Auth/SigninScreen';
import SignupScreen from '../Screens/Auth/SignupScreen';
import ConcoursScreen from '../Screens/Home/ConcoursScreen';
import GrattageScreen from '../Screens/Home/GrattageScreen';
import MinijeuxScreen from '../Screens/Home/MinijeuxScreen';
import ParraindorScreen from '../Screens/Home/ParraindorScreen';
import { Image } from 'react-native';
import { Images } from '../Utils/images';
import AuthLoadingScreen from '../Screens/Auth/AuthLoadingScreen';
import UserPrefScreen from '../Screens/UserPrefScreen';
import ForgotPasswordScreen from '../Screens/Auth/ForgotPasswordScreen';
import CrownScreen from '../Screens/CrownScreen';
import WalletScreen from '../Screens/WalletScreen';
import WheelSelectionScreen from '../Screens/Wheel/WheelSelectionScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import ProfileEditScreen from '../Screens/Profile/ProfileEditScreen';
import WheelNormalScreen from '../Screens/Wheel/WheelNormalScreen';
import WheelPremiumScreen from '../Screens/Wheel/WheelPremiumScreen';
import ChangeInterestsScreen from '../Screens/Profile/ChangeInterestsScreen';
import ChangePasswordScreen from '../Screens/Profile/ChangePasswordScreen';
import ContactUsScreen from '../Screens/Profile/ContactUsScreen';
import WebGameScreen from '../Screens/WebGameScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName='Concours'
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarLabel: () => { return null },
            })}>
            <Tab.Screen name={"Concours"} component={ConcourStackNavigator}
                options={{
                    tabBarLabel: 'Concours',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={
                                focused ?
                                    Images.Concours_Active
                                    : Images.Concours
                            }
                            style={{ height: 28, width: 40 }}
                            resizeMode={'cover'}
                        />
                    ),
                }} />
            <Tab.Screen name={"Grattage"} component={GrattageStackNavigator}
                options={{
                    tabBarLabel: 'Grattage',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={
                                focused ?
                                    Images.Grattage_Active
                                    : Images.Grattage
                            }
                            style={{ height: 28, width: 40 }}
                            resizeMode={'cover'}
                        />
                    ),
                }}
            />
            <Tab.Screen name={"Minijeux"} component={MinijeuxStackNavigator}
                options={{
                    tabBarLabel: 'Mini-jeux',
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={
                                focused ?
                                    Images.Minijeux_Active
                                    : Images.Minijeux
                            }
                            style={{ height: 28, width: 40 }}
                            resizeMode={'cover'}
                        />
                    ),
                }} />
            <Tab.Screen name={"Parraindor"} component={ParraindorStackNavigator}
                options={{
                    tabBarLabel: `Parrain d'or`,
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={
                                focused ?
                                    Images.Parrain_Active
                                    : Images.Parrain
                            }
                            style={{ height: 28, width: 40 }}
                            resizeMode={'cover'}
                        />
                    ),
                }} />
        </Tab.Navigator>
    );
}

function WheelStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'WheelSelectionScreen'}>
            <Stack.Screen name={"WheelSelectionScreen"} component={WheelSelectionScreen} />
            <Stack.Screen name={"WheelNormalScreen"} component={WheelNormalScreen} />
            <Stack.Screen name={"WheelPremiumScreen"} component={WheelPremiumScreen} />
        </Stack.Navigator>
    )
}


function ConcourStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'ConcoursScreen'}>
            <Stack.Screen name={"ConcoursScreen"} component={ConcoursScreen} />
            <Stack.Screen name={"WheelStack"} component={WheelStackNavigator} />
            <Stack.Screen name={"WalletScreen"} component={WalletScreen} />
            <Stack.Screen name={"CrownScreen"} component={CrownScreen} />
            <Stack.Screen name={"ProfileScreen"} component={ProfileScreen} />
            <Stack.Screen name={"ProfileEditScreen"} component={ProfileEditScreen} />
            <Stack.Screen name={"ChangeInterestsScreen"} component={ChangeInterestsScreen} />
            <Stack.Screen name={"ChangePasswordScreen"} component={ChangePasswordScreen} />
            <Stack.Screen name={"ContactUsScreen"} component={ContactUsScreen} />
        </Stack.Navigator>
    );
}


function GrattageStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'GrattageScreen'}>
            <Stack.Screen name={"GrattageScreen"} component={GrattageScreen} />
        </Stack.Navigator>
    );
}

function MinijeuxStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'MinijeuxScreen'}>
            <Stack.Screen name={"MinijeuxScreen"} component={MinijeuxScreen} />
        </Stack.Navigator>
    );
}

function ParraindorStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'ParraindorScreen'}>
            <Stack.Screen name={"ParraindorScreen"} component={ParraindorScreen} />
        </Stack.Navigator>
    );
}

function AuthStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'SigninScreen'}>
            <Stack.Screen name={"SigninScreen"} component={SigninScreen} />
            <Stack.Screen name={"SignupScreen"} component={SignupScreen} />
            <Stack.Screen name={"ForgotPasswordScreen"} component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

export function Routes() {
    return (
        <NavigationContainer headerMode="none" ref={(ref) => setTopLevelNavigation(ref)}>
            <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }} initialRouteName={"AuthLoadingScreen"}>
                <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} />
                <Stack.Screen name="UserPrefScreen" component={UserPrefScreen} />
                <Stack.Screen name="Auth" component={AuthStackNavigator} />
                <Stack.Screen name="Home" component={TabNavigator} />
                <Stack.Screen name="WebGameScreen" component={WebGameScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Routes;
