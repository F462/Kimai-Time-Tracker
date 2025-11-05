import React from 'react';

import {PersistGate} from 'redux-persist/integration/react';
import {Portal} from 'react-native-paper';
import {Provider} from 'react-redux';

import {persistor, store} from 'src/features/data/context/store';
import {Onboarding} from 'src/features/onboarding/components/Onboarding';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {SessionLocker} from 'src/features/utils/components/SessionLocker';
import {ThemeProvider} from 'src/features/theming/components/ThemeProvider';
import i18n from 'src/features/localization/utils/i18n';

// Run initial configuration for i18n;
i18n;

import {SafeAreaProvider} from 'react-native-safe-area-context';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {retries: 3});

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider>
				<PersistGate loading={null} persistor={persistor}>
					<Portal.Host>
						<SafeAreaProvider>
							<SessionLocker />
							<Onboarding />
							<RootNavigation />
						</SafeAreaProvider>
					</Portal.Host>
				</PersistGate>
			</ThemeProvider>
		</Provider>
	);
}

export default App;
