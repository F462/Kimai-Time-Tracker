import {useCallback, useState} from 'react';
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

import {useAppDispatch} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {updateActivity} from '../middleware/activitiesThunks';
import {Activity} from '../types';

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

type EditActivityModalProps = {
	activity: Activity;
	visible: boolean;
	onHideModal: () => void;
};

export const EditActivityModal = ({
	activity,
	visible,
	onHideModal,
}: EditActivityModalProps) => {
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

	const [name, setName] = useState(activity.name);
	const [number, setNumber] = useState(activity.number ?? '');
	const [comment, setComment] = useState(activity.comment ?? '');
	const [isVisible, setIsVisible] = useState(activity.visible);
	const [isBillable, setIsBillable] = useState(activity.billable);

	const onSave = useCallback(() => {
		if (!name.trim()) {
			return;
		}

		dispatch(
			updateActivity({
				...activity,
				name: name.trim(),
				number: number || null,
				comment: comment || null,
				visible: isVisible,
				billable: isBillable,
			}),
		).catch(console.error);
		onHideModal();
	}, [
		activity,
		comment,
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
				<Text variant="headlineSmall">{t('editActivity')}</Text>
				<View style={styles.modalContent}>
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
					<Button mode="contained" onPress={onSave} disabled={!name.trim()}>
						{t('save')}
					</Button>
				</View>
			</Modal>
		</Portal>
	);
};
