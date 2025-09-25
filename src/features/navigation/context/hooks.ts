import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ScreenParameters} from '../ScreenParameters';
import {useNavigation} from '@react-navigation/native';

export const useAppNavigation = useNavigation<
	DrawerNavigationProp<ScreenParameters>
>;
