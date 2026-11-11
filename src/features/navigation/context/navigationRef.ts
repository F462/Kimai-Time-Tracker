import {createNavigationContainerRef} from '@react-navigation/native';

import {ScreenParameters} from '../ScreenParameters';

/**
 * A ref to the root `NavigationContainer`, attached in `RootNavigation`.
 *
 * It allows components mounted *outside* the navigator (e.g. the headless
 * `NfcIntegration`) to navigate programmatically, such as guiding the user
 * to a screen from an alert dialog.
 */
export const navigationRef = createNavigationContainerRef<ScreenParameters>();

/**
 * Navigates to the given screen if the navigator is ready. No-ops otherwise
 * (e.g. while the session is locked and the navigator is not mounted).
 */
export const navigateToScreen = (name: keyof ScreenParameters) => {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name as never);
	}
};
