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

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
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

type SyncJob = {
	key: string;
	Component: React.ComponentType;
};

const syncJobs: SyncJob[] = [{key: 'workContract', Component: WorkContractJob}];

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
