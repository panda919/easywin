import { CommonActions, useNavigation } from '@react-navigation/native';

let navigationRef;

export function setTopLevelNavigation(navigatorRef) {
	navigationRef = navigatorRef;
}

export function resetNavigateTo(navigation, routeName, params) {
	navigation.dispatch(
		CommonActions.reset({
			index: 1,
			routes: [{ name: routeName, params, merge: true }],
		}),
	);
}

export function resetNavigate(routeName, params) {
	navigationRef.dispatch(
		CommonActions.reset({
			index: 1,
			routes: [{ name: routeName, params, merge: true }],
		}),
	);
}

export function navigationCheckShouldComponentUpdate(props) {
	const { navigation } = props;
	return navigation.isFocused();
}
