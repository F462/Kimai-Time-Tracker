import {
	combineReducers,
	configureStore,
	createListenerMiddleware,
} from '@reduxjs/toolkit';
import {accountReducer} from 'src/features/account/context/accountSlice';
import {customersReducer} from '../../customers/context/customersSlice';
import AsyncStorage from '@react-native-community/async-storage';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE,
} from 'redux-persist';
import {startRootListener} from '../middleware/rootListener';

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
};

const rootReducer = combineReducers({
	account: accountReducer,
	customers: customersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const listenerMiddleware = createListenerMiddleware();
const middlewares = [listenerMiddleware.middleware];
startRootListener();

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				// ignore redux persist actions in serializable check
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).prepend(middlewares),
});

export const persistor = persistStore(store, null, () => {});
