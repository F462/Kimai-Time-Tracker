import React from 'react';
import {RootNavigation} from 'src/features/navigation/components/RootNavigation';
import {Provider} from 'react-redux';
import {store} from 'src/features/data/context/store';

function App() {
  return (
    <Provider store={store}>
      <RootNavigation />
    </Provider>
  );
}

export default App;
