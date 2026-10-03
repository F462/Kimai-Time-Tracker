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
import {updateProject} from '../middleware/projectsThunks';
import {Project} from '../types';

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

type EditProjectModalProps = {
	project: Project;
	visible: boolean;
	onHideModal: () => void;
};

export const EditProjectModal = ({
	project,
	visible,
	onHideModal,
}: EditProjectModalProps) => {
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

	const [name, setName] = useState(project.name);
	const [number, setNumber] = useState(project.number);
	const [comment, setComment] = useState(project.comment ?? '');
	const [isVisible, setIsVisible] = useState(project.visible);
	const [isBillable, setIsBillable] = useState(project.billable);

	const onSave = useCallback(() => {
		if (!name.trim()) {
			return;
		}

		dispatch(
			updateProject({
				...project,
				name: name.trim(),
				number: number.trim(),
				comment: comment || null,
				visible: isVisible,
				billable: isBillable,
			}),
		).catch(console.error);
		onHideModal();
	}, [
		comment,
		dispatch,
		isBillable,
		isVisible,
		name,
		number,
		onHideModal,
		project,
	]);

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onHideModal}
				contentContainerStyle={[styles.modal, dynamicStyles.modal]}>
				<Text variant="headlineSmall">{t('editProject')}</Text>
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
