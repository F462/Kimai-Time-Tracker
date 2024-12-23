import React from 'react';
import {FlatList, View} from 'react-native';
import {useAppSelector} from '../../data/context/store';
import {selectCustomerList} from '../context/customersSelectors';
import {Customer} from '../types';
import {Text} from 'react-native-paper';

const CustomerItem = ({customer}: {customer: Customer}) => {
	return <View>
		<Text>{customer.name}</Text>
	</View>;
};

const CustomerList = () => {
	const customerList = useAppSelector(selectCustomerList);

	return <FlatList data={customerList} renderItem={({item}) => <CustomerItem customer={item} />} />;
};

export const CustomersScreen = () => {
	return <View><CustomerList /></View>;
};
