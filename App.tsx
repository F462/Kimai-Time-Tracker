import React from 'react';
import {createStaticNavigation} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {AuthorizationScreen} from 'src/features/authorization/components/AuthorizationScreen';

const drawer = createDrawerNavigator({
  screens: {
    Authorization: AuthorizationScreen,
  },
});
const Navigation = createStaticNavigation(drawer);

function App() {
  return (
    <Navigation />
  );
}

export default App;
