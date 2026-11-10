import React from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {
	Button,
	IconButton,
	List,
	Modal,
	Portal,
	Text,
	useTheme,
} from 'react-native-paper';

import {selectHasUnsynchronizedCustomers} from 'src/features/customers/context/customersSelectors';
import {synchronizeLocalCustomers} from 'src/features/customers/middleware/customersThunks';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {selectHasUnsynchronizedProjects} from 'src/features/projects/context/projectsSelectors';
import {synchronizeLocalProjects} from 'src/features/projects/middleware/projectsThunks';
import {
	selectIsWorkContractHoursSyncInProgress,
	selectIsWorkContractHoursSyncPending,
	selectIsWorkContractHoursSyncWaiting,
} from 'src/features/settings/context/settingsSelectors';
import {
	abortWorkContractHoursSync,
	synchronizeWorkContractHours,
} from 'src/features/settings/middleware/settingsThunks';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {selectHasUnsynchronizedUsers} from 'src/features/users/context/usersSelectors';
import {synchronizeLocalUsers} from 'src/features/users/middleware/usersThunks';

const styles = StyleSheet.create({
	modal: {
		padding: 20,
		margin: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	activeActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	syncButton: {
		alignSelf: 'center',
	},
});

const WorkContractJobIcon = () => <List.Icon icon="briefcase-outline" />;

const WorkContractJobAction = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const isSyncPending = useAppSelector(selectIsWorkContractHoursSyncPending);
	const isSyncWaiting = useAppSelector(selectIsWorkContractHoursSyncWaiting);
	const isSyncInProgress = useAppSelector(
		selectIsWorkContractHoursSyncInProgress,
	);

	if (isSyncInProgress || isSyncWaiting) {
		return (
			<View style={styles.activeActions}>
				{isSyncInProgress ? (
					<ActivityIndicator size="small" accessibilityRole="progressbar" />
				) : null}
				<IconButton
					icon="close"
					accessibilityLabel={t('abortWorkContractSync')}
					onPress={() => dispatch(abortWorkContractHoursSync())}
				/>
			</View>
		);
	}

	if (isSyncPending) {
		return (
			<Button
				mode="contained"
				accessibilityLabel={t('synchronize')}
				style={styles.syncButton}
				onPress={() => {
					dispatch(
						synchronizeWorkContractHours({
							direction: isSyncPending ? 'push' : 'pull',
						}),
					)
						.unwrap()
						.catch(() => undefined);
				}}>
				{t('synchronize')}
			</Button>
		);
	}

	return (
		<IconButton
			icon="check"
			disabled
			accessibilityLabel={t('workContractSyncDone')}
			style={styles.syncButton}
		/>
	);
};

const WorkContractJob = () => {
	const {t} = useTranslation();
	const isSyncInProgress = useAppSelector(
		selectIsWorkContractHoursSyncInProgress,
	);
	const isSyncWaiting = useAppSelector(selectIsWorkContractHoursSyncWaiting);
	const isSyncPending = useAppSelector(selectIsWorkContractHoursSyncPending);

	const description = (() => {
		if (isSyncInProgress) {
			return t('workContractSyncInProgress');
		}
		if (isSyncWaiting) {
			return t('workContractSyncPending');
		}
		if (!isSyncPending) {
			return t('workContractSyncDone');
		}
		return t('workContractDescription');
	})();

	return (
		<List.Item
			title={t('workContract')}
			description={description}
			left={WorkContractJobIcon}
			right={WorkContractJobAction}
		/>
	);
};

const LocalCustomersJobIcon = () => <List.Icon icon="account-group-outline" />;

const LocalCustomersJobAction = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedCustomers);

	return (
		<IconButton
			icon={isSyncPending ? 'cloud-upload-outline' : 'check'}
			disabled={!isSyncPending}
			accessibilityLabel={t(isSyncPending ? 'synchronize' : 'entitySyncDone')}
			onPress={() => {
				dispatch(synchronizeLocalCustomers())
					.unwrap()
					.catch(() => undefined);
			}}
		/>
	);
};

const LocalCustomersJob = () => {
	const {t} = useTranslation();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedCustomers);

	return (
		<List.Item
			title={t('screenTitles.Customers')}
			description={t(isSyncPending ? 'entitySyncPending' : 'entitySyncDone')}
			left={LocalCustomersJobIcon}
			right={LocalCustomersJobAction}
		/>
	);
};

const LocalProjectsJobIcon = () => (
	<List.Icon icon="briefcase-variant-outline" />
);

const LocalProjectsJobAction = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedProjects);
	const hasUnsynchronizedCustomers = useAppSelector(
		selectHasUnsynchronizedCustomers,
	);

	return (
		<IconButton
			icon={isSyncPending ? 'cloud-upload-outline' : 'check'}
			disabled={!isSyncPending || hasUnsynchronizedCustomers}
			accessibilityLabel={t(isSyncPending ? 'synchronize' : 'entitySyncDone')}
			onPress={() => {
				dispatch(synchronizeLocalProjects())
					.unwrap()
					.catch(() => undefined);
			}}
		/>
	);
};

const LocalProjectsJob = () => {
	const {t} = useTranslation();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedProjects);

	return (
		<List.Item
			title={t('screenTitles.Projects')}
			description={t(isSyncPending ? 'entitySyncPending' : 'entitySyncDone')}
			left={LocalProjectsJobIcon}
			right={LocalProjectsJobAction}
		/>
	);
};

const LocalUsersJobIcon = () => <List.Icon icon="account-multiple-outline" />;

const LocalUsersJobAction = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedUsers);

	return (
		<IconButton
			icon={isSyncPending ? 'cloud-upload-outline' : 'check'}
			disabled={!isSyncPending}
			accessibilityLabel={t(isSyncPending ? 'synchronize' : 'entitySyncDone')}
			onPress={() => {
				dispatch(synchronizeLocalUsers())
					.unwrap()
					.catch(() => undefined);
			}}
		/>
	);
};

const LocalUsersJob = () => {
	const {t} = useTranslation();
	const isSyncPending = useAppSelector(selectHasUnsynchronizedUsers);

	return (
		<List.Item
			title={t('screenTitles.Users')}
			description={t(isSyncPending ? 'entitySyncPending' : 'entitySyncDone')}
			left={LocalUsersJobIcon}
			right={LocalUsersJobAction}
		/>
	);
};

type SyncJob = {
	key: string;
	Component: React.ComponentType;
};

const syncJobs: SyncJob[] = [
	{key: 'users', Component: LocalUsersJob},
	{key: 'customers', Component: LocalCustomersJob},
	{key: 'projects', Component: LocalProjectsJob},
	{key: 'workContract', Component: WorkContractJob},
];

type SynchronizeModalProps = {
	visible: boolean;
	onHide: () => void;
};

export const SynchronizeModal = ({visible, onHide}: SynchronizeModalProps) => {
	const {t} = useTranslation();
	const theme = useTheme();

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
				onDismiss={onHide}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<View style={styles.header}>
					<Text variant="headlineSmall">{t('synchronizationTitle')}</Text>
					<IconButton
						icon="close"
						accessibilityLabel={t('dismiss')}
						onPress={onHide}
					/>
				</View>
				<List.Section>
					{syncJobs.map(({key, Component: Job}) => (
						<Job key={key} />
					))}
				</List.Section>
			</Modal>
		</Portal>
	);
};
