import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
	Button,
	Modal,
	Portal,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {createCustomer} from '../middleware/customersThunks';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
	modalContent: {
		marginVertical: 10,
		maxHeight: '70%',
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

type AddCustomerModalProps = {
	visible: boolean;
	onHideModal: () => void;
};

export const AddCustomerModal = ({
	visible,
	onHideModal,
}: AddCustomerModalProps) => {
	const dispatch = useAppDispatch();
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

	const [name, setName] = useState('');
	const [number, setNumber] = useState('');
	const [comment, setComment] = useState('');
	const [country, setCountry] = useState('');
	const [language, setLanguage] = useState('en');
	const [currency, setCurrency] = useState('EUR');
	const [timezone, setTimezone] = useState(
		new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
	);
	const [isVisible, setIsVisible] = useState(true);
	const [isBillable, setIsBillable] = useState(true);

	useEffect(() => {
		if (visible) {
			setName('');
			setNumber('');
			setComment('');
			setCountry('');
			setLanguage('en');
			setCurrency('EUR');
			setTimezone(
				new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
			);
			setIsVisible(true);
			setIsBillable(true);
		}
	}, [visible]);

	const onSave = useCallback(() => {
		if (
			!name.trim() ||
			!country.trim() ||
			!language.trim() ||
			!currency.trim() ||
			!timezone.trim()
		) {
			return;
		}

		dispatch(
			createCustomer({
				name: name.trim(),
				country: country.trim(),
				language: language.trim(),
				currency: currency.trim(),
				timezone: timezone.trim(),
				number: number || null,
				comment: comment || null,
				visible: isVisible,
				billable: isBillable,
			}),
		).catch(console.error);

		onHideModal();
	}, [
		comment,
		country,
		currency,
		dispatch,
		isBillable,
		isVisible,
		language,
		name,
		number,
		onHideModal,
		timezone,
	]);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('addCustomer')}</Text>
				<ScrollView style={styles.modalContent}>
					<TextInput
						label={t('name')}
						mode="outlined"
						value={name}
						onChangeText={setName}
					/>
					<TextInput
						label={t('number')}
						mode="outlined"
						value={number}
						onChangeText={setNumber}
					/>
					<TextInput
						label={t('country')}
						mode="outlined"
						value={country}
						onChangeText={setCountry}
						autoCapitalize="characters"
					/>
					<TextInput
						label={t('language')}
						mode="outlined"
						value={language}
						onChangeText={setLanguage}
					/>
					<TextInput
						label={t('currency')}
						mode="outlined"
						value={currency}
						onChangeText={setCurrency}
						autoCapitalize="characters"
					/>
					<TextInput
						label={t('timezone')}
						mode="outlined"
						value={timezone}
						onChangeText={setTimezone}
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
				</ScrollView>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button
						mode="contained"
						onPress={onSave}
						disabled={
							!name.trim() ||
							!country.trim() ||
							!language.trim() ||
							!currency.trim() ||
							!timezone.trim()
						}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
