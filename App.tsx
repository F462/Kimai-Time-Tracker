import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';

import {persistor, store} from 'src/features/data/context/store';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import i18n from 'src/features/localization/utils/i18n';

// Run initial configuration for i18n;
i18n;

function App() {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<RootNavigation />
				</NavigationContainer>
			</PersistGate>
		</Provider>
	);
}

export default App;
