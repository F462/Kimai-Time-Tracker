import React from 'react';
import {Portal} from 'react-native-paper';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {TimesheetWidgetIntegration} from 'src/features/activeTimesheet/components/TimesheetWidgetIntegration';
import {persistor, store} from 'src/features/data/context/store';
import i18n from 'src/features/localization/utils/i18n';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {Onboarding} from 'src/features/onboarding/components/Onboarding';
import {ThemeProvider} from 'src/features/theming/components/ThemeProvider';
import {SessionLocker} from 'src/features/utils/components/SessionLocker';

// Run initial configuration for i18n;
i18n;

import {SafeAreaProvider} from 'react-native-safe-area-context';

function App() {
	return (
		<Provider store={store}>
			<ThemeProvider>
				<PersistGate loading={null} persistor={persistor}>
					<TimesheetWidgetIntegration />
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
