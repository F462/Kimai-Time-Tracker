import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {getLocales} from 'react-native-localize';
import {
	Button,
	Modal,
	Portal,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {CustomerColorField} from 'src/features/customers/components/CustomerColorField';
import {fetchCustomerColors} from 'src/features/customers/middleware/customersThunks';
import {LANGUAGES, TIMEZONES} from 'src/features/customers/utils/options';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {selectUserList} from 'src/features/users/context/usersSelectors';
import {
	createUser,
	fetchUserTeams,
	updateUser,
	UserTeam,
} from 'src/features/users/middleware/usersThunks';
import {User} from 'src/features/users/types';
import {BaseMultiSelector} from 'src/ui/Selectors/BaseMultiSelector';
import {BaseSelector} from 'src/ui/Selectors/BaseSelector';
import {OptionSelector} from 'src/ui/Selectors/OptionSelector';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 16,
		maxHeight: '90%',
	},
	header: {
		marginBottom: 8,
	},
	field: {
		marginVertical: 6,
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 8,
		gap: 12,
	},
	switchText: {
		flex: 1,
	},
	switchHelp: {
		opacity: 0.7,
	},
	errorContainer: {
		marginBottom: 12,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
		gap: 12,
	},
});

type UserModalProps = {
	user?: User;
	visible: boolean;
	onHideModal: () => void;
};

const defaultTimezone = () => {
	try {
		return new Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
};

const localeOptions = (currentLocale: string) => {
	const defaults = [
		'en_US',
		'en_GB',
		'de_DE',
		'de_CH',
		'fr_FR',
		'es_ES',
		'ja_JP',
	];
	const deviceLocale = (getLocales()[0]?.languageTag ?? 'en_US').replace(
		'-',
		'_',
	);
	const values = [
		...new Set([
			currentLocale.replace('-', '_'),
			defaults.includes(deviceLocale) ? deviceLocale : 'en_US',
			...defaults,
		]),
	];
	return values.map((value) => ({value, label: value.replace('_', '-')}));
};

const USER_LANGUAGES = [
	'ar',
	'bg',
	'ca',
	'cs',
	'da',
	'de',
	'de_CH',
	'el',
	'en',
	'eo',
	'es',
	'eu',
	'fa',
	'fi',
	'fo',
	'fr',
	'he',
	'hr',
	'hu',
	'id',
	'it',
	'ja',
	'ko',
	'nb_NO',
	'nl',
	'pa',
	'pl',
	'pt',
	'pt_BR',
	'ro',
	'ru',
	'sk',
	'sl',
	'sr',
	'sv',
	'ta',
	'tr',
	'uk',
	'vi',
	'zh_CN',
	'zh_Hant',
	'zh_Hant_TW',
].map((value) => ({
	value,
	label:
		LANGUAGES.find((languageOption) => languageOption.value === value)?.label ??
		value.replaceAll('_', ' '),
}));

export const UserModal = ({user, visible, onHideModal}: UserModalProps) => {
	const dispatch = useAppDispatch();
	const {t} = useTranslation();
	const theme = useTheme();
	const userList = useAppSelector(selectUserList);
	const isEdit = user !== undefined;
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [alias, setAlias] = useState('');
	const [title, setTitle] = useState('');
	const [accountNumber, setAccountNumber] = useState('');
	const [color, setColor] = useState('');
	const [userColors, setUserColors] = useState<Record<string, string>>({});
	const [language, setLanguage] = useState('en');
	const [locale, setLocale] = useState('en_US');
	const [timezone, setTimezone] = useState(defaultTimezone());
	const [supervisorId, setSupervisorId] = useState<number | undefined>();
	const [teams, setTeams] = useState<Array<UserTeam>>([]);
	const [teamList, setTeamList] = useState<Array<UserTeam>>([]);
	const [roles, setRoles] = useState('ROLE_USER');
	const [enabled, setEnabled] = useState(true);
	const [systemAccount, setSystemAccount] = useState(false);
	const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const dynamicStyles = useStyle(
		() => ({
			modal: {backgroundColor: theme.colors.background},
			errorText: {color: theme.colors.error},
		}),
		[theme.colors.background, theme.colors.error],
	);

	const localeChoices = useMemo(() => localeOptions(locale), [locale]);
	const languageOptions = useMemo(() => {
		if (USER_LANGUAGES.some((option) => option.value === language)) {
			return USER_LANGUAGES;
		}
		return [{value: language, label: language}, ...USER_LANGUAGES];
	}, [language]);
	const timezones = useMemo(
		() =>
			TIMEZONES.some((option) => option.value === timezone)
				? TIMEZONES
				: [
						{value: timezone, label: timezone.replaceAll('_', ' ')},
						...TIMEZONES,
					],
		[timezone],
	);
	const supervisorChoices = useMemo(
		() =>
			userList
				.filter((item) => item.id !== user?.id)
				.map((item) => ({
					id: item.id,
					name: item.alias || item.username,
				})),
		[user?.id, userList],
	);
	const selectedSupervisor = supervisorChoices.find(
		(item) => item.id === supervisorId,
	);

	useEffect(() => {
		if (!visible) {
			return;
		}

		setSaveError(null);
		setUsername(user?.username ?? '');
		setEmail(user?.email ?? '');
		setPassword('');
		setPasswordConfirmation('');
		setAlias(user?.alias ?? '');
		setTitle(user?.title ?? '');
		setAccountNumber(user?.accountNumber ?? '');
		setColor(user?.color ?? '');
		setLanguage(user?.language ?? 'en');
		setLocale(user?.locale ?? 'en_US');
		setTimezone(user?.timezone ?? defaultTimezone());
		setSupervisorId(user?.supervisor?.id);
		setTeams(
			user?.memberships
				? user.memberships.map(({team}) => ({
						id: team.id,
						name: team.name,
						color: team.color,
					}))
				: (user?.teams ?? []).map((team) => ({
						id: team.id,
						name: team.name,
						color: team.color,
					})),
		);
		setRoles(user?.roles?.join(', ') ?? 'ROLE_USER');
		setEnabled(user?.enabled ?? true);
		setSystemAccount(user?.systemAccount ?? false);
		setRequiresPasswordReset(false);
	}, [user, visible]);

	useEffect(() => {
		if (!visible) {
			return;
		}
		let active = true;
		dispatch(fetchCustomerColors())
			.unwrap()
			.then((colors) => {
				if (active) {
					setUserColors(colors);
				}
			})
			.catch((error: unknown) => {
				console.warn(`Could not load configured user colors: ${String(error)}`);
			});
		return () => {
			active = false;
		};
	}, [dispatch, visible]);

	useEffect(() => {
		if (!visible) {
			return;
		}
		let active = true;
		dispatch(fetchUserTeams())
			.unwrap()
			.then((loadedTeams) => {
				if (active) {
					setTeamList(loadedTeams);
				}
			})
			.catch((error: unknown) => {
				console.warn(`Could not load user teams: ${String(error)}`);
			});
		return () => {
			active = false;
		};
	}, [dispatch, visible]);

	const extractErrorMessage = useCallback(
		(action: {error?: {message?: string}}) =>
			action.error?.message || t('userSaveError'),
		[t],
	);

	const passwordsMatch =
		isEdit || (password.length > 0 && password === passwordConfirmation);
	const canSave =
		username.trim().length >= 2 &&
		email.trim().length > 0 &&
		language.length > 0 &&
		locale.length > 0 &&
		timezone.length > 0 &&
		passwordsMatch &&
		!saving;

	const onSave = useCallback(async () => {
		if (!canSave) {
			return;
		}

		setSaving(true);
		setSaveError(null);
		const roleList = roles
			.split(',')
			.map((role) => role.trim())
			.filter(Boolean);
		try {
			if (user) {
				const resultAction = await dispatch(
					updateUser({
						id: user.id,
						alias: alias.trim(),
						title: title.trim(),
						accountNumber: accountNumber.trim(),
						color: color.trim() || null,
						email: email.trim(),
						language,
						locale,
						timezone,
						supervisor: supervisorId ?? null,
						roles: roleList,
						enabled,
						teams: teams.map((team) => team.id),
					}),
				);
				if (updateUser.rejected.match(resultAction)) {
					setSaveError(extractErrorMessage(resultAction));
					return;
				}
			} else {
				const resultAction = await dispatch(
					createUser({
						username: username.trim(),
						email: email.trim(),
						plainPassword: password,
						language,
						locale,
						timezone,
						alias: alias.trim(),
						title: title.trim(),
						accountNumber: accountNumber.trim(),
						color: color.trim(),
						supervisor: supervisorId,
						roles: roleList,
						enabled,
						systemAccount,
						requiresPasswordReset,
						teams: teams.map((team) => team.id),
					}),
				);
				if (createUser.rejected.match(resultAction)) {
					setSaveError(extractErrorMessage(resultAction));
					return;
				}
			}
			onHideModal();
		} catch (error: unknown) {
			setSaveError(
				(error as {message?: string})?.message || t('userSaveError'),
			);
		} finally {
			setSaving(false);
		}
	}, [
		accountNumber,
		alias,
		canSave,
		color,
		dispatch,
		email,
		enabled,
		extractErrorMessage,
		language,
		locale,
		onHideModal,
		password,
		requiresPasswordReset,
		roles,
		supervisorId,
		systemAccount,
		teams,
		title,
		timezone,
		t,
		user,
		username,
	]);

	const onSupervisorSelection = useCallback(
		(
			selection: Parameters<
				React.ComponentProps<typeof BaseSelector>['onSelection']
			>[0],
		) => {
			const selected = selection.selectedList[0];
			setSupervisorId(selected?._id ? Number(selected._id) : undefined);
		},
		[],
	);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<View style={styles.header}>
					<Text variant="titleLarge">
						{isEdit ? t('editUser') : t('addUser')}
					</Text>
				</View>
				{saveError !== null && (
					<View style={styles.errorContainer}>
						<Text variant="labelLarge" style={dynamicStyles.errorText}>
							{t('userSaveError')}
						</Text>
						{saveError !== t('userSaveError') && (
							<Text variant="bodySmall" style={dynamicStyles.errorText}>
								{saveError}
							</Text>
						)}
					</View>
				)}
				<ScrollView keyboardShouldPersistTaps="handled">
					<TextInput
						label={`${t('username')} *`}
						mode="outlined"
						value={username}
						onChangeText={setUsername}
						autoCapitalize="none"
						disabled={isEdit}
						style={styles.field}
					/>
					<TextInput
						label={`${t('email')} *`}
						mode="outlined"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.field}
					/>
					{!isEdit && (
						<>
							<TextInput
								label={`${t('password')} *`}
								mode="outlined"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								style={styles.field}
							/>
							<TextInput
								label={`${t('passwordConfirmation')} *`}
								mode="outlined"
								value={passwordConfirmation}
								onChangeText={setPasswordConfirmation}
								secureTextEntry
								error={passwordConfirmation.length > 0 && !passwordsMatch}
								style={styles.field}
							/>
						</>
					)}
					<TextInput
						label={t('name')}
						mode="outlined"
						value={alias}
						onChangeText={setAlias}
						style={styles.field}
					/>
					<TextInput
						label={t('title')}
						mode="outlined"
						value={title}
						onChangeText={setTitle}
						style={styles.field}
					/>
					<View style={styles.field}>
						<CustomerColorField
							value={color || null}
							colors={userColors}
							onChange={(selectedColor) => setColor(selectedColor ?? '')}
						/>
					</View>
					<View style={styles.field}>
						<OptionSelector
							options={languageOptions}
							selectedValue={language}
							label={`${t('language')} *`}
							onSelection={setLanguage}
						/>
					</View>
					<View style={styles.field}>
						<OptionSelector
							options={timezones}
							selectedValue={timezone}
							label={`${t('timezone')} *`}
							onSelection={setTimezone}
						/>
					</View>
					<TextInput
						label={t('accountNumber')}
						mode="outlined"
						value={accountNumber}
						onChangeText={setAccountNumber}
						style={styles.field}
					/>
					<View style={styles.field}>
						<BaseSelector
							elements={supervisorChoices}
							selectedElement={selectedSupervisor}
							label={t('supervisor')}
							emptyOptionLabel={t('noSupervisor')}
							onSelection={onSupervisorSelection}
						/>
					</View>
					<View style={styles.field}>
						<BaseMultiSelector
							elements={teamList}
							selectedElements={teams}
							label={t('team')}
							onSelection={setTeams}
						/>
					</View>
					<TextInput
						label={t('roles')}
						mode="outlined"
						value={roles}
						onChangeText={setRoles}
						style={styles.field}
					/>
					<View style={styles.field}>
						<OptionSelector
							options={localeChoices}
							selectedValue={locale}
							label={`${t('dateTimeNumberFormat')} *`}
							onSelection={setLocale}
						/>
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('active')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('activeUserHelp')}
							</Text>
						</View>
						<Switch value={enabled} onValueChange={setEnabled} />
					</View>
					{!isEdit && (
						<>
							<View style={styles.switchRow}>
								<View style={styles.switchText}>
									<Text variant="bodyMedium">{t('systemAccount')}</Text>
									<Text variant="bodySmall" style={styles.switchHelp}>
										{t('systemAccountHelp')}
									</Text>
								</View>
								<Switch
									value={systemAccount}
									onValueChange={setSystemAccount}
								/>
							</View>
							<View style={styles.switchRow}>
								<View style={styles.switchText}>
									<Text variant="bodyMedium">{t('requiresPasswordReset')}</Text>
									<Text variant="bodySmall" style={styles.switchHelp}>
										{t('requiresPasswordResetHelp')}
									</Text>
								</View>
								<Switch
									value={requiresPasswordReset}
									onValueChange={setRequiresPasswordReset}
								/>
							</View>
						</>
					)}
				</ScrollView>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button
						mode="contained"
						loading={saving}
						onPress={() => {
							onSave().catch(console.error);
						}}
						disabled={!canSave}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
