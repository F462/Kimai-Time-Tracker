import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {getLocales} from 'react-native-localize';
import {
	Button,
	IconButton,
	Modal,
	Portal,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {OptionSelector} from 'src/ui/Selectors/OptionSelector';
import {
	createCustomer,
	fetchCustomerColors,
	updateCustomer,
} from '../middleware/customersThunks';
import {Customer} from '../types';
import {COUNTRIES, CURRENCIES, LANGUAGES} from '../utils/options';
import {CustomerColorField} from './CustomerColorField';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 16,
		maxHeight: '85%',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	errorContainer: {
		marginBottom: 12,
	},
	field: {
		marginVertical: 6,
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginVertical: 8,
		gap: 12,
	},
	switchText: {
		flex: 1,
	},
	switchHelp: {
		opacity: 0.7,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
		gap: 12,
	},
});

/**
 * Kimai requires a valid ISO 3166-1 alpha-2 country on every customer, so we
 * always need a sensible default. Prefer the device region when it is one of
 * the offered countries; otherwise fall back to a neutral default.
 */
const defaultCountryFromLocale = (): string => {
	try {
		const region = getLocales()[0]?.countryCode;
		if (region && COUNTRIES.some((c) => c.value === region)) {
			return region;
		}
	} catch {
		// ignore and fall back
	}
	return 'DE';
};

type CustomerModalProps = {
	customer?: Customer;
	visible: boolean;
	onHideModal: () => void;
};

export const CustomerModal = ({
	customer,
	visible,
	onHideModal,
}: CustomerModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
			errorText: {
				color: theme.colors.error,
			},
		}),
		[theme.colors.background, theme.colors.error],
	);

	const isEdit = customer !== undefined;

	const [name, setName] = useState('');
	const [number, setNumber] = useState('');
	const [comment, setComment] = useState('');
	const [country, setCountry] = useState('DE');
	const [language, setLanguage] = useState('en');
	const [currency, setCurrency] = useState('EUR');
	const [color, setColor] = useState<string | null>(null);
	const [customerColors, setCustomerColors] = useState<Record<string, string>>(
		{},
	);
	const [isVisible, setIsVisible] = useState(true);
	const [isBillable, setIsBillable] = useState(true);
	const [saveError, setSaveError] = useState<string | null>(null);

	useEffect(() => {
		if (!visible) {
			return;
		}

		setSaveError(null);

		if (customer) {
			setName(customer.name);
			setNumber(customer.number);
			setComment(customer.comment ?? '');
			setCountry(
				customer.country && customer.country.length > 0
					? customer.country
					: defaultCountryFromLocale(),
			);
			setLanguage(customer.language);
			setCurrency(customer.currency);
			setColor(customer.color);
			setIsVisible(customer.visible);
			setIsBillable(customer.billable);
		} else {
			setName('');
			setNumber('');
			setComment('');
			setCountry(defaultCountryFromLocale());
			setLanguage('en');
			setCurrency('EUR');
			setColor(null);
			setIsVisible(true);
			setIsBillable(true);
		}
	}, [visible, customer]);

	useEffect(() => {
		if (!visible) {
			return;
		}

		let active = true;
		setCustomerColors({});
		dispatch(fetchCustomerColors())
			.unwrap()
			.then((colors) => {
				if (active) {
					setCustomerColors(colors);
				}
			})
			.catch((error: unknown) => {
				console.warn(
					`Could not load configured customer colors: ${String(error)}`,
				);
			});

		return () => {
			active = false;
		};
	}, [dispatch, visible]);

	const isValid = name.trim().length > 0;

	const extractErrorMessage = useCallback(
		(action: {error?: {message?: string}}) => {
			const message = action.error?.message;
			return message && message.length > 0 ? message : t('customerSaveError');
		},
		[t],
	);

	const onSave = useCallback(async () => {
		if (!isValid) {
			return;
		}

		setSaveError(null);

		if (customer) {
			const resultAction = await dispatch(
				updateCustomer({
					...customer,
					name: name.trim(),
					country,
					language,
					currency,
					number: number.trim(),
					comment: comment || null,
					color,
					visible: isVisible,
					billable: isBillable,
				}),
			);

			if (updateCustomer.rejected.match(resultAction)) {
				setSaveError(extractErrorMessage(resultAction));
				return;
			}
		} else {
			const resultAction = await dispatch(
				createCustomer({
					name: name.trim(),
					country,
					language,
					currency,
					number: number || null,
					comment: comment || null,
					color,
					visible: isVisible,
					billable: isBillable,
				}),
			);

			if (createCustomer.rejected.match(resultAction)) {
				setSaveError(extractErrorMessage(resultAction));
				return;
			}
		}

		onHideModal();
	}, [
		color,
		comment,
		country,
		currency,
		customer,
		dispatch,
		extractErrorMessage,
		isBillable,
		isValid,
		isVisible,
		language,
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
				<View style={styles.header}>
					<Text variant="titleLarge">
						{isEdit ? t('editCustomer') : t('addCustomer')}
					</Text>
					<IconButton icon="close" onPress={onHideModal} />
				</View>
				{saveError !== null && (
					<View style={styles.errorContainer}>
						<Text variant="labelLarge" style={dynamicStyles.errorText}>
							{t('customerSaveError')}
						</Text>
						{saveError !== t('customerSaveError') && (
							<Text variant="bodySmall" style={dynamicStyles.errorText}>
								{saveError}
							</Text>
						)}
					</View>
				)}
				<ScrollView>
					<TextInput
						label={`${t('name')} *`}
						mode="outlined"
						value={name}
						onChangeText={setName}
						style={styles.field}
					/>
					<CustomerColorField
						value={color}
						colors={customerColors}
						onChange={setColor}
					/>
					<TextInput
						label={t('description')}
						mode="outlined"
						value={comment}
						onChangeText={setComment}
						multiline
						style={styles.field}
					/>
					<TextInput
						label={t('customerNumber')}
						mode="outlined"
						value={number}
						onChangeText={setNumber}
						style={styles.field}
					/>
					<View style={styles.field}>
						<OptionSelector
							options={COUNTRIES}
							selectedValue={country}
							label={`${t('country')} *`}
							onSelection={setCountry}
						/>
					</View>
					<View style={styles.field}>
						<OptionSelector
							options={LANGUAGES}
							selectedValue={language}
							label={`${t('language')} *`}
							onSelection={setLanguage}
						/>
					</View>
					<View style={styles.field}>
						<OptionSelector
							options={CURRENCIES}
							selectedValue={currency}
							label={`${t('currency')} *`}
							onSelection={setCurrency}
						/>
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('visible')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('visibleHelp')}
							</Text>
						</View>
						<Switch value={isVisible} onValueChange={setIsVisible} />
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('billable')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('billableHelp')}
							</Text>
						</View>
						<Switch value={isBillable} onValueChange={setIsBillable} />
					</View>
				</ScrollView>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button
						mode="contained"
						onPress={() => {
							onSave().catch(console.error);
						}}
						disabled={!isValid}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
