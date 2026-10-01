import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';

import {ScreenParameters} from '../ScreenParameters';

export const useAppNavigation = useNavigation<
	DrawerNavigationProp<ScreenParameters>
>;
