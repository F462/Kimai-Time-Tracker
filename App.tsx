import React from 'react';

import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';

import {persistor, store} from 'src/features/data/context/store';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {ThemeProvider} from 'src/features/theming/components/ThemeProvider';
import i18n from 'src/features/localization/utils/i18n';

// Run initial configuration for i18n;
i18n;

function App() {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ThemeProvider>
					<RootNavigation />
				</ThemeProvider>
			</PersistGate>
		</Provider>
	);
}

export default App;
