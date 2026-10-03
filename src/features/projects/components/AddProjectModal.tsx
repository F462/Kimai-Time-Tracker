import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {
	Button,
	Modal,
	Portal,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {selectCustomerList} from 'src/features/customers/context/customersSelectors';
import {Customer} from 'src/features/customers/types';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {parseSelectedId} from 'src/features/timesheets/utils/functions';
import {BaseSelector} from 'src/ui/Selectors/BaseSelector';
import {createProject} from '../middleware/projectsThunks';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
	modalContent: {
		marginVertical: 10,
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
});

type AddProjectModalProps = {
	visible: boolean;
	onHideModal: () => void;
};

export const AddProjectModal = ({
	visible,
	onHideModal,
}: AddProjectModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();
	const customerList = useAppSelector(selectCustomerList);

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
		}),
		[theme.colors.background],
	);

	const [name, setName] = useState('');
	const [customer, setCustomer] = useState<Customer | undefined>();
	const [number, setNumber] = useState('');
	const [comment, setComment] = useState('');
	const [isVisible, setIsVisible] = useState(true);
	const [isBillable, setIsBillable] = useState(true);

	useEffect(() => {
		if (visible) {
			setName('');
			setCustomer(undefined);
			setNumber('');
			setComment('');
			setIsVisible(true);
			setIsBillable(true);
		}
	}, [visible]);

	const onCustomerSelection = useCallback(
		(
			value: Parameters<
				React.ComponentProps<typeof BaseSelector>['onSelection']
			>[0],
		) => {
			const selectedCustomerId = parseSelectedId(value.selectedList[0]);
			setCustomer(customerList.find((item) => item.id === selectedCustomerId));
		},
		[customerList],
	);

	const onSave = useCallback(() => {
		if (!name.trim() || !customer) {
			return;
		}

		dispatch(
			createProject({
				name: name.trim(),
				customer: customer.id,
				number: number.trim() || null,
				comment: comment.trim() || null,
				visible: isVisible,
				billable: isBillable,
			}),
		).catch(console.error);

		onHideModal();
	}, [
		comment,
		customer,
		dispatch,
		isBillable,
		isVisible,
		name,
		number,
		onHideModal,
	]);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('addProject')}</Text>
				<View style={styles.modalContent}>
					<TextInput
						label={t('name')}
						mode="outlined"
						value={name}
						onChangeText={setName}
					/>
					<BaseSelector
						elements={customerList}
						selectedElement={customer}
						label={t('selectCustomer')}
						onSelection={onCustomerSelection}
					/>
					<TextInput
						label={t('number')}
						mode="outlined"
						value={number}
						onChangeText={setNumber}
					/>
					<TextInput
						label={t('comment')}
						mode="outlined"
						value={comment}
						onChangeText={setComment}
						multiline
					/>
					<View style={styles.switchRow}>
						<Text>{t('visible')}</Text>
						<Switch value={isVisible} onValueChange={setIsVisible} />
					</View>
					<View style={styles.switchRow}>
						<Text>{t('billable')}</Text>
						<Switch value={isBillable} onValueChange={setIsBillable} />
					</View>
				</View>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button
						mode="contained"
						onPress={onSave}
						disabled={!name.trim() || !customer}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
