import React, {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {BaseScreen} from 'src/ui/BaseScreen';
import {DividedList} from 'src/ui/DividedList';
import {EntityListItem} from 'src/ui/EntityListItem';
import {
	selectCustomerList,
	selectSelectedCustomerId,
} from '../context/customersSelectors';
import {customerSelected} from '../context/customersSlice';
import {Customer} from '../types';
import {CustomerItemContextMenu} from './CustomerItemContextMenu';

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
	const customerList = useAppSelector(selectCustomerList);
	const selectedCustomerId = useAppSelector(selectSelectedCustomerId);

	return (
		<DividedList
			data={customerList}
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
	return (
		<BaseScreen>
			<CustomerList />
		</BaseScreen>
	);
};
