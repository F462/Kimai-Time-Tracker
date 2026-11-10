import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {FAB, Icon, Text, useTheme} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {ListItem} from 'src/ui/ListItem';
import {ListItemText} from 'src/ui/ListItemText';
import {selectUserList} from '../context/usersSelectors';
import {fetchUsers} from '../middleware/usersThunks';
import {User} from '../types';
import {UserModal} from './UserModal';

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
	item: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingHorizontal: 16,
	},
	itemBody: {
		flex: 1,
	},
	secondary: {
		opacity: 0.72,
	},
	status: {
		alignItems: 'flex-end',
	},
});

const UserItem = ({user, onPress}: {user: User; onPress: () => void}) => {
	const theme = useTheme();
	const {t} = useTranslation();
	const displayName = user.alias || user.username;

	return (
		<ListItem onPress={onPress}>
			<View style={styles.item}>
				<Icon
					source={
						user.systemAccount ? 'account-cog-outline' : 'account-outline'
					}
					size={24}
					color={user.color || theme.colors.onSurfaceVariant}
				/>
				<View style={styles.itemBody}>
					<ListItemText>{displayName}</ListItemText>
					<Text variant="bodySmall" style={styles.secondary}>
						{user.email}
					</Text>
				</View>
				<View style={styles.status}>
					{user.systemAccount && (
						<Text variant="labelSmall" style={styles.secondary}>
							{t('systemUser')}
						</Text>
					)}
					{user.enabled === false && (
						<Text variant="labelSmall" style={styles.secondary}>
							{t('inactiveUser')}
						</Text>
					)}
				</View>
			</View>
		</ListItem>
	);
};

export const UsersScreen = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();
	const users = useAppSelector(selectUserList);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingUser, setEditingUser] = useState<User | undefined>();
	const theme = useTheme();
	const dynamicStyles = useStyle(
		() => ({empty: {color: theme.colors.onSurfaceVariant}}),
		[theme.colors.onSurfaceVariant],
	);

	useEffect(() => {
		dispatch(fetchUsers()).catch(console.error);
	}, [dispatch]);

	const onRefresh = useCallback(() => dispatch(fetchUsers()), [dispatch]);
	const onAdd = useCallback(() => {
		setEditingUser(undefined);
		setModalVisible(true);
	}, []);
	const onEdit = useCallback((user: User) => {
		setEditingUser(user);
		setModalVisible(true);
	}, []);
	const onHideModal = useCallback(() => setModalVisible(false), []);

	return (
		<BaseScreen>
			{users.length === 0 ? (
				<View style={styles.item}>
					<Text variant="bodyMedium" style={dynamicStyles.empty}>
						{t('noUsers')}
					</Text>
				</View>
			) : (
				<DividedList
					data={users}
					onRefresh={onRefresh}
					showDividers={false}
					renderItem={({item}) => (
						<UserItem user={item} onPress={() => onEdit(item)} />
					)}
				/>
			)}
			<FAB
				icon="plus"
				label={t('addUser')}
				onPress={onAdd}
				style={styles.fab}
			/>
			<UserModal
				user={editingUser}
				visible={modalVisible}
				onHideModal={onHideModal}
			/>
		</BaseScreen>
	);
};
