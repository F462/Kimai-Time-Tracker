import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
	Button,
	List,
	Modal,
	Portal,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';

import {CustomerColorField} from 'src/features/customers/components/CustomerColorField';
import {selectCustomerList} from 'src/features/customers/context/customersSelectors';
import {fetchCustomerColors} from 'src/features/customers/middleware/customersThunks';
import {Customer} from 'src/features/customers/types';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {parseSelectedId} from 'src/features/timesheets/utils/functions';
import {DateField} from 'src/ui/DateField';
import {BaseMultiSelector} from 'src/ui/Selectors/BaseMultiSelector';
import {BaseSelector} from 'src/ui/Selectors/BaseSelector';
import {OptionSelector} from 'src/ui/Selectors/OptionSelector';
import {
	createProject,
	fetchTeams,
	Team,
	updateProject,
} from '../middleware/projectsThunks';
import {Project} from '../types';
import {
	BUDGET_TYPE_FULL,
	BUDGET_TYPES,
	formatTimeBudget,
	fromApiBudgetType,
	parseTimeBudget,
	toApiBudgetType,
} from '../utils/options';

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

type ProjectModalProps = {
	/**
	 * The project to edit. When `undefined`, the modal is in "add" mode and
	 * creates a new project; when set, it is in "edit" mode and updates the
	 * given project.
	 */
	project?: Project;
	visible: boolean;
	onHideModal: () => void;
};

export const ProjectModal = ({
	project,
	visible,
	onHideModal,
}: ProjectModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();
	const customerList = useAppSelector(selectCustomerList);
	const isEdit = project !== undefined;

	const dynamicStyles = useStyle(
		() => ({
			modal: {
				backgroundColor: theme.colors.background,
			},
			errorText: {
				color: theme.colors.error,
			},
			helpText: {
				color: theme.colors.onSurfaceVariant,
			},
		}),
		[
			theme.colors.background,
			theme.colors.error,
			theme.colors.onSurfaceVariant,
		],
	);

	const [name, setName] = useState('');
	const [color, setColor] = useState<string | null>(null);
	const [projectColors, setProjectColors] = useState<Record<string, string>>(
		{},
	);
	const [comment, setComment] = useState('');
	const [customer, setCustomer] = useState<Customer | undefined>();
	const [number, setNumber] = useState('');
	const [start, setStart] = useState<string | null>(null);
	const [end, setEnd] = useState<string | null>(null);
	const [lockedUntil, setLockedUntil] = useState<string | null>(null);
	const [budget, setBudget] = useState('');
	const [timeBudget, setTimeBudget] = useState('0:00');
	const [budgetType, setBudgetType] = useState<string>(BUDGET_TYPE_FULL);
	const [teams, setTeams] = useState<Array<Team>>([]);
	const [teamList, setTeamList] = useState<Array<Team>>([]);
	const [orderNumber, setOrderNumber] = useState('');
	const [orderDate, setOrderDate] = useState<string | null>(null);
	const [invoiceText, setInvoiceText] = useState('');
	const [isVisible, setIsVisible] = useState(true);
	const [isBillable, setIsBillable] = useState(true);
	const [globalActivities, setGlobalActivities] = useState(true);
	const [datesExpanded, setDatesExpanded] = useState(false);
	const [budgetExpanded, setBudgetExpanded] = useState(false);
	const [invoiceExpanded, setInvoiceExpanded] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	useEffect(() => {
		if (!visible) {
			return;
		}

		setSaveError(null);

		if (project) {
			setName(project.name);
			setColor(project.color);
			setComment(project.comment ?? '');
			setCustomer(undefined);
			setNumber(project.number ?? '');
			setStart(project.start);
			setEnd(project.end);
			setLockedUntil(project.lockedUntil);
			setBudget(
				project.budget != null && project.budget > 0
					? project.budget.toString()
					: '',
			);
			setTimeBudget(formatTimeBudget(project.timeBudget));
			setBudgetType(fromApiBudgetType(project.budgetType));
			setTeams(
				(project.teams ?? []).map((entry) => {
					const team = entry as Team;
					return {id: team.id, name: team.name};
				}),
			);
			setOrderNumber(project.orderNumber ?? '');
			setOrderDate(project.orderDate ?? null);
			setInvoiceText(project.invoiceText ?? '');
			setIsVisible(project.visible);
			setIsBillable(project.billable);
			setGlobalActivities(project.globalActivities);
		} else {
			setName('');
			setColor(null);
			setComment('');
			setCustomer(undefined);
			setNumber('');
			setStart(null);
			setEnd(null);
			setLockedUntil(null);
			setBudget('');
			setTimeBudget('0:00');
			setBudgetType(BUDGET_TYPE_FULL);
			setTeams([]);
			setOrderNumber('');
			setOrderDate(null);
			setInvoiceText('');
			setIsVisible(true);
			setIsBillable(true);
			setGlobalActivities(true);
		}
		setDatesExpanded(false);
		setBudgetExpanded(false);
		setInvoiceExpanded(false);
	}, [visible, project]);

	useEffect(() => {
		if (!visible) {
			return;
		}

		let active = true;
		setProjectColors({});
		dispatch(fetchCustomerColors())
			.unwrap()
			.then((colors) => {
				if (active) {
					setProjectColors(colors);
				}
			})
			.catch((error: unknown) => {
				console.warn(`Could not load configured colors: ${String(error)}`);
			});

		return () => {
			active = false;
		};
	}, [dispatch, visible]);

	useEffect(() => {
		if (!visible || isEdit) {
			return;
		}

		let active = true;
		setTeamList([]);
		dispatch(fetchTeams())
			.unwrap()
			.then((result) => {
				if (active) {
					setTeamList(result ?? []);
				}
			})
			.catch((error: unknown) => {
				console.warn(`Could not load teams: ${String(error)}`);
			});

		return () => {
			active = false;
		};
	}, [dispatch, isEdit, visible]);

	const budgetTypeOptions = useMemo(
		() =>
			BUDGET_TYPES.map((option) => ({
				value: option.value,
				label: t(option.label),
			})),
		[t],
	);

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

	const extractErrorMessage = useCallback(
		(action: {error?: {message?: string}}) => {
			const message = action.error?.message;
			return message && message.length > 0 ? message : t('projectSaveError');
		},
		[t],
	);

	const canSave = name.trim() !== '' && (isEdit || customer !== undefined);

	const onSave = useCallback(async () => {
		if (!canSave) {
			return;
		}

		setSaveError(null);

		const budgetValue =
			budget.trim().length > 0 && Number.isFinite(Number(budget))
				? Number(budget)
				: null;
		const timeBudgetValue = parseTimeBudget(timeBudget) ?? 0;

		if (project) {
			const resultAction = await dispatch(
				updateProject({
					...project,
					name: name.trim(),
					number: number.trim(),
					comment: comment.trim() || null,
					visible: isVisible,
					billable: isBillable,
					globalActivities,
					color,
					start,
					end,
					lockedUntil,
					orderNumber: orderNumber.trim() || null,
					orderDate,
					budget: budgetValue,
					timeBudget: timeBudgetValue,
					budgetType: toApiBudgetType(budgetType),
					...(invoiceText.trim() ? {invoiceText: invoiceText.trim()} : {}),
				}),
			);

			if (updateProject.rejected.match(resultAction)) {
				setSaveError(extractErrorMessage(resultAction));
				return;
			}
		} else if (customer) {
			const resultAction = await dispatch(
				createProject({
					name: name.trim(),
					customer: customer.id,
					number: number.trim() || null,
					comment: comment.trim() || null,
					visible: isVisible,
					billable: isBillable,
					globalActivities,
					color,
					start,
					end,
					lockedUntil,
					orderNumber: orderNumber.trim() || null,
					orderDate,
					budget: budgetValue,
					timeBudget: timeBudgetValue,
					budgetType: toApiBudgetType(budgetType),
					invoiceText: invoiceText.trim() || null,
					teams: teams.map((team) => team.id),
				}),
			);

			if (createProject.rejected.match(resultAction)) {
				setSaveError(extractErrorMessage(resultAction));
				return;
			}
		} else {
			return;
		}

		onHideModal();
	}, [
		budget,
		budgetType,
		canSave,
		comment,
		color,
		customer,
		dispatch,
		end,
		extractErrorMessage,
		globalActivities,
		invoiceText,
		isBillable,
		isVisible,
		lockedUntil,
		name,
		number,
		onHideModal,
		orderDate,
		orderNumber,
		project,
		start,
		teams,
		timeBudget,
	]);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<View style={styles.header}>
					<Text variant="titleLarge">
						{isEdit ? t('editProject') : t('addProject')}
					</Text>
				</View>
				{saveError !== null && (
					<View style={styles.errorContainer}>
						<Text variant="labelLarge" style={dynamicStyles.errorText}>
							{t('projectSaveError')}
						</Text>
						{saveError !== t('projectSaveError') && (
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
						colors={projectColors}
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
					{!isEdit && (
						<BaseSelector
							elements={customerList}
							selectedElement={customer}
							label={`${t('selectCustomer')} *`}
							onSelection={onCustomerSelection}
						/>
					)}
					<TextInput
						label={t('projectNumber')}
						mode="outlined"
						value={number}
						onChangeText={setNumber}
						style={styles.field}
					/>
					<List.Accordion
						title={t('projectDates')}
						expanded={datesExpanded}
						onPress={() => setDatesExpanded((expanded) => !expanded)}>
						<DateField
							label={t('projectStart')}
							value={start}
							description={t('startHelp')}
							onValueChange={setStart}
						/>
						<DateField
							label={t('projectEnd')}
							value={end}
							description={t('endHelp')}
							onValueChange={setEnd}
						/>
						<DateField
							label={t('lockedUntil')}
							value={lockedUntil}
							description={t('lockedUntilHelp')}
							onValueChange={setLockedUntil}
						/>
					</List.Accordion>
					<List.Accordion
						title={t('budgets')}
						expanded={budgetExpanded}
						onPress={() => setBudgetExpanded((expanded) => !expanded)}>
						<TextInput
							label={t('budget')}
							mode="outlined"
							value={budget}
							onChangeText={setBudget}
							keyboardType="decimal-pad"
							style={styles.field}
						/>
						<TextInput
							label={t('timeBudget')}
							mode="outlined"
							value={timeBudget}
							onChangeText={setTimeBudget}
							keyboardType="number-pad"
							style={styles.field}
						/>
						<View style={styles.field}>
							<OptionSelector
								options={budgetTypeOptions}
								selectedValue={budgetType}
								label={t('budgetType')}
								onSelection={setBudgetType}
							/>
						</View>
					</List.Accordion>
					{!isEdit && (
						<View style={styles.field}>
							<BaseMultiSelector
								elements={teamList}
								selectedElements={teams}
								label={t('team')}
								onSelection={setTeams}
							/>
							<Text variant="bodySmall" style={dynamicStyles.helpText}>
								{t('teamHelp')}
							</Text>
						</View>
					)}
					<List.Accordion
						title={t('invoices')}
						expanded={invoiceExpanded}
						onPress={() => setInvoiceExpanded((expanded) => !expanded)}>
						<TextInput
							label={t('orderNumber')}
							mode="outlined"
							value={orderNumber}
							onChangeText={setOrderNumber}
							style={styles.field}
						/>
						<DateField
							label={t('orderDate')}
							value={orderDate}
							onValueChange={setOrderDate}
						/>
						<TextInput
							label={t('invoiceText')}
							mode="outlined"
							value={invoiceText}
							onChangeText={setInvoiceText}
							multiline
							numberOfLines={4}
							style={styles.field}
						/>
						<Text variant="bodySmall" style={dynamicStyles.helpText}>
							{t('projectInvoiceTextHelp')}
						</Text>
					</List.Accordion>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('visible')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('projectVisibleHelp')}
							</Text>
						</View>
						<Switch value={isVisible} onValueChange={setIsVisible} />
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('billable')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('projectBillableHelp')}
							</Text>
						</View>
						<Switch value={isBillable} onValueChange={setIsBillable} />
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('globalActivities')}</Text>
							<Text variant="bodySmall" style={styles.switchHelp}>
								{t('globalActivitiesHelp')}
							</Text>
						</View>
						<Switch
							value={globalActivities}
							onValueChange={setGlobalActivities}
						/>
					</View>
				</ScrollView>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal}>{t('dismiss')}</Button>
					<Button
						mode="contained"
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
