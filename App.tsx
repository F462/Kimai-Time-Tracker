import React from 'react';

import {PersistGate} from 'redux-persist/integration/react';
import {Portal} from 'react-native-paper';
import {Provider} from 'react-redux';

import {persistor, store} from 'src/features/data/context/store';
import {Onboarding} from 'src/features/onboarding/components/Onboarding';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {ThemeProvider} from 'src/features/theming/components/ThemeProvider';
import {WearableResponder} from 'src/features/wearableCommunication/WearableResponder';
import i18n from 'src/features/localization/utils/i18n';
import {useIsOnWearable} from 'src/features/utils/useIsOnWearable';

// Run initial configuration for i18n;
i18n;

import {SafeAreaProvider} from 'react-native-safe-area-context';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {retries: 3});

const AppOnDevice = () => {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<Portal.Host>
					<SafeAreaProvider>
						<WearableResponder />
						<Onboarding />
						<RootNavigation />
					</SafeAreaProvider>
				</Portal.Host>
			</PersistGate>
		</Provider>
	);
};

function App() {
	const isOnWearable = useIsOnWearable();

	const AppToRender = (() => {
		switch (isOnWearable) {
			case true:
			case false:
				return AppOnDevice;
			default:
				return null;
		}
	})();

	if (AppToRender === null) {
		return null;
	}

	return (
		<ThemeProvider>
			<AppToRender />
		</ThemeProvider>
	);
}

export default App;
