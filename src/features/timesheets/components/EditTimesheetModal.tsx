import {Button, Modal, Portal, Text, useTheme} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

import {Timesheet} from '../types';
import {useStyle} from '../../theming/utils/useStyle';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});

type EditTimesheetModalProps = {
	timesheet: Timesheet;
	visible: boolean;
	onHideModal: () => void;
};

export const EditTimesheetModal = ({
	visible,
	onHideModal,
}: EditTimesheetModalProps) => {
	const theme = useTheme();
	const {t} = useTranslation();

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('editTimesheet')}</Text>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button mode="contained">{t('save')}</Button>
				</View>
			</Modal>
		</Portal>
	);
};
