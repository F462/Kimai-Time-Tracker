import React from 'react';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {Provider} from 'react-redux';
import {persistor, store} from 'src/features/data/context/store';
import {PersistGate} from 'redux-persist/integration/react';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootNavigation />
      </PersistGate>
    </Provider>
  );
}

export default App;
