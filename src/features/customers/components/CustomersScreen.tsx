import React from 'react';

import {Text} from 'react-native-paper';
import {View} from 'react-native';

import {Customer} from '../types';
import {DividedList} from 'src/ui/DividedList';
import {selectCustomerList} from '../context/customersSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const CustomerItem = ({customer}: {customer: Customer}) => {
	return <View>
		<Text>{customer.name}</Text>
	</View>;
};

const CustomerList = () => {
	const customerList = useAppSelector(selectCustomerList);

	return <DividedList data={customerList} renderItem={({item}) => <CustomerItem customer={item} />} />;
};

export const CustomersScreen = () => {
	return <View><CustomerList /></View>;
};
