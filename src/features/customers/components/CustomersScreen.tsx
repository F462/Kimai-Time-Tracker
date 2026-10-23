import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectCustomerList,
	selectSelectedCustomerId,
} from '../context/customersSelectors';
import {customerSelected} from '../context/customersSlice';
import {fetchCustomers} from '../middleware/customersThunks';
import {Customer} from '../types';
import {CustomerItemContextMenu} from './CustomerItemContextMenu';
import {CustomerModal} from './CustomerModal';

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
	},
});

const CustomerItem = ({
	customer,
	isSelected,
}: {
	customer: Customer;
	isSelected: boolean;
}) => {
	const dispatch = useAppDispatch();
	const [contextMenuVisible, setContextMenuVisible] = useState(false);

	const onSelectCustomer = useCallback(() => {
		dispatch(customerSelected(customer.id));
	}, [dispatch, customer.id]);
	const onOpenContextMenu = useCallback(() => setContextMenuVisible(true), []);
	const onHideContextMenu = useCallback(() => setContextMenuVisible(false), []);

	return (
		<EntityListItem
			name={customer.name}
			isSelected={isSelected}
			onPress={onSelectCustomer}
			onLongPress={onOpenContextMenu}
			contextMenu={
				<CustomerItemContextMenu
					customer={customer}
					visible={contextMenuVisible}
					onHideMenu={onHideContextMenu}
				/>
			}
		/>
	);
};

const CustomerList = () => {
	const dispatch = useAppDispatch();
	const customerList = useAppSelector(selectCustomerList);
	const selectedCustomerId = useAppSelector(selectSelectedCustomerId);
	const onRefresh = useCallback(() => dispatch(fetchCustomers()), [dispatch]);

	return (
		<DividedList
			data={customerList}
			onRefresh={onRefresh}
			showDividers={false}
			renderItem={({item}) => (
				<CustomerItem
					customer={item}
					isSelected={item.id === selectedCustomerId}
				/>
			)}
		/>
	);
};

export const CustomersScreen = () => {
	const {t} = useTranslation();
	const [addModalVisible, setAddModalVisible] = useState(false);

	const onShowAddModal = useCallback(() => setAddModalVisible(true), []);
	const onHideAddModal = useCallback(() => setAddModalVisible(false), []);

	return (
		<BaseScreen>
			<CustomerList />
			<FAB
				icon="plus"
				label={t('addCustomer')}
				onPress={onShowAddModal}
				style={styles.fab}
			/>
			<CustomerModal visible={addModalVisible} onHideModal={onHideAddModal} />
		</BaseScreen>
	);
};
