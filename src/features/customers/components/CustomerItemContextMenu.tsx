import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Button, Modal, Portal, Text, useTheme} from 'react-native-paper';

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {removeCustomer} from '../middleware/customersThunks';
import {Customer} from '../types';

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	modal: {
		margin: 20,
		padding: 20,
	},
	modalContent: {
		marginVertical: 10,
	},
});

type CustomerItemContextMenuProps = {
	customer: Customer;
	visible: boolean;
	onHideMenu: () => void;
};

export const CustomerItemContextMenu = ({
	customer,
	visible,
	onHideMenu,
}: CustomerItemContextMenuProps) => {
	const theme = useTheme();
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const onConfirmDelete = useCallback(() => {
		dispatch(removeCustomer(customer.id)).catch(console.error);
		onHideMenu();
	}, [customer.id, dispatch, onHideMenu]);

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
				onDismiss={onHideMenu}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('deleteCustomer')}</Text>
				<View style={styles.modalContent}>
					<Text>{t('deleteCustomerWarning')}</Text>
				</View>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideMenu}>{t('dismiss')}</Button>
					<Button mode="contained" onPress={onConfirmDelete}>
						{t('delete')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
