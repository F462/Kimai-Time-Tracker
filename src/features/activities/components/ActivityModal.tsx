import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, StyleSheet, View} from 'react-native';
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

import {CustomerColorField} from 'src/features/customers/components/CustomerColorField';
import {fetchCustomerColors} from 'src/features/customers/middleware/customersThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectProjects} from 'src/features/projects/context/projectsSelectors';
import {Project} from 'src/features/projects/types';
import {
	BUDGET_TYPE_FULL,
	BUDGET_TYPES,
	formatTimeBudget,
	fromApiBudgetType,
	parseTimeBudget,
	toApiBudgetType,
} from 'src/features/projects/utils/options';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {OptionSelector} from 'src/ui/Selectors/OptionSelector';
import {ProjectSelector} from 'src/ui/Selectors/ProjectSelector';
import {
	createActivity,
	CreateActivityPayload,
	updateActivity,
} from '../middleware/activitiesThunks';
import {Activity} from '../types';

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
	projectSelectorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	projectSelector: {
		flex: 1,
	},
	groupLabel: {
		marginTop: 12,
		marginBottom: 4,
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
	errorContainer: {
		marginBottom: 8,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
		gap: 12,
	},
});

type ActivityModalProps = {
	activity?: Activity;
	visible: boolean;
	onHideModal: () => void;
};

export const ActivityModal = ({
	activity,
	visible,
	onHideModal,
}: ActivityModalProps) => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const {t} = useTranslation();
	const projects = useAppSelector(selectProjects);
	const isEdit = activity !== undefined;
	const dynamicStyles = useStyle(
		() => ({
			modal: {backgroundColor: theme.colors.background},
			helpText: {color: theme.colors.onSurfaceVariant},
			errorText: {color: theme.colors.error},
		}),
		[
			theme.colors.background,
			theme.colors.error,
			theme.colors.onSurfaceVariant,
		],
	);

	const [name, setName] = useState('');
	const [number, setNumber] = useState('');
	const [comment, setComment] = useState('');
	const [color, setColor] = useState<string | null>(null);
	const [colors, setColors] = useState<Record<string, string>>({});
	const [projectId, setProjectId] = useState<number | undefined>();
	const [budget, setBudget] = useState('');
	const [timeBudget, setTimeBudget] = useState('0:00');
	const [budgetType, setBudgetType] = useState(BUDGET_TYPE_FULL);
	const [isVisible, setIsVisible] = useState(true);
	const [isBillable, setIsBillable] = useState(true);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!visible) {
			return;
		}
		setName(activity?.name ?? '');
		setNumber(activity?.number ?? '');
		setComment(activity?.comment ?? '');
		setColor(activity?.color ?? null);
		setProjectId(activity?.project ?? undefined);
		setBudget(activity?.budget != null ? String(activity.budget) : '');
		setTimeBudget(formatTimeBudget(activity?.timeBudget));
		setBudgetType(fromApiBudgetType(activity?.budgetType));
		setIsVisible(activity?.visible ?? true);
		setIsBillable(activity?.billable ?? true);
		setSaveError(null);
	}, [activity, visible]);

	useEffect(() => {
		if (!visible) {
			return;
		}

		let active = true;
		setColors({});
		dispatch(fetchCustomerColors())
			.unwrap()
			.then((result) => {
				if (active) {
					setColors(result);
				}
			})
			.catch((error: unknown) => {
				console.warn(`Could not load configured colors: ${String(error)}`);
			});

		return () => {
			active = false;
		};
	}, [dispatch, visible]);

	const budgetTypeOptions = useMemo(
		() =>
			BUDGET_TYPES.map((option) => ({
				value: option.value,
				label: t(option.label),
			})),
		[t],
	);

	const budgetValue = budget.trim().length
		? Number(budget.trim().replace(',', '.'))
		: null;
	const timeBudgetValue = parseTimeBudget(timeBudget);
	const canSave =
		name.trim().length > 0 &&
		(budgetValue === null || Number.isFinite(budgetValue)) &&
		timeBudgetValue !== null &&
		!saving;

	const onSave = useCallback(async () => {
		if (!canSave) {
			return;
		}

		setSaving(true);
		setSaveError(null);
		const payload: CreateActivityPayload = {
			name: name.trim(),
			number: number.trim() || null,
			comment: comment.trim() || null,
			visible: isVisible,
			billable: isBillable,
			project: projectId ?? null,
			color,
			budget: budgetValue,
			timeBudget: timeBudgetValue,
			budgetType: toApiBudgetType(budgetType),
		};

		try {
			if (activity) {
				await dispatch(updateActivity({...activity, ...payload})).unwrap();
			} else {
				await dispatch(createActivity(payload)).unwrap();
			}
			onHideModal();
		} catch (error: unknown) {
			const message = (error as {message?: string})?.message;
			setSaveError(message || t('activitySaveError'));
		} finally {
			setSaving(false);
		}
	}, [
		activity,
		budgetType,
		budgetValue,
		canSave,
		color,
		comment,
		dispatch,
		isBillable,
		isVisible,
		name,
		number,
		onHideModal,
		projectId,
		t,
		timeBudgetValue,
	]);

	const selectedProject =
		projectId === undefined ? undefined : projects[projectId];

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<View style={styles.header}>
					<Text variant="titleLarge">
						{t(isEdit ? 'editActivity' : 'addActivity')}
					</Text>
				</View>
				{saveError !== null && (
					<View style={styles.errorContainer}>
						<Text variant="labelLarge" style={dynamicStyles.errorText}>
							{t('activitySaveError')}
						</Text>
						<Text variant="bodySmall" style={dynamicStyles.errorText}>
							{saveError}
						</Text>
					</View>
				)}
				<ScrollView keyboardShouldPersistTaps="handled">
					<TextInput
						label={`${t('name')} *`}
						mode="outlined"
						value={name}
						onChangeText={setName}
						style={styles.field}
					/>
					<View style={styles.field}>
						<CustomerColorField
							value={color}
							colors={colors}
							onChange={setColor}
						/>
					</View>
					<TextInput
						label={t('description')}
						mode="outlined"
						value={comment}
						onChangeText={setComment}
						multiline
						numberOfLines={3}
						style={styles.field}
					/>
					<View style={styles.field}>
						<View style={styles.projectSelectorRow}>
							<View style={styles.projectSelector}>
								<ProjectSelector
									selectedProject={selectedProject}
									onSelectProject={(project: Project | undefined) =>
										setProjectId(project?.id)
									}
									label={t('project')}
								/>
							</View>
							{projectId !== undefined && (
								<IconButton
									icon="close"
									accessibilityLabel={t('clearSelection')}
									onPress={() => setProjectId(undefined)}
								/>
							)}
						</View>
						<Text variant="bodySmall" style={dynamicStyles.helpText}>
							{t('activityProjectHelp')}
						</Text>
					</View>
					<TextInput
						label={t('activityNumber')}
						mode="outlined"
						value={number}
						onChangeText={setNumber}
						style={styles.field}
					/>
					<Text variant="titleMedium" style={styles.groupLabel}>
						{t('budgets')}
					</Text>
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
						keyboardType="numbers-and-punctuation"
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
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('visible')}</Text>
							<Text variant="bodySmall" style={dynamicStyles.helpText}>
								{t('activityVisibleHelp')}
							</Text>
						</View>
						<Switch value={isVisible} onValueChange={setIsVisible} />
					</View>
					<View style={styles.switchRow}>
						<View style={styles.switchText}>
							<Text variant="bodyMedium">{t('billable')}</Text>
							<Text variant="bodySmall" style={dynamicStyles.helpText}>
								{t('activityBillableHelp')}
							</Text>
						</View>
						<Switch value={isBillable} onValueChange={setIsBillable} />
					</View>
				</ScrollView>
				<View style={styles.buttonContainer}>
					<Button onPress={onHideModal} disabled={saving}>
						{t('dismiss')}
					</Button>
					<Button
						mode="contained"
						onPress={() => {
							onSave().catch(console.error);
						}}
						disabled={!canSave}
						loading={saving}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
