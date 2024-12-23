import {
	combineReducers,
	configureStore,
	createListenerMiddleware,
	TypedStartListening
} from '@reduxjs/toolkit';
import {accountReducer} from 'src/features/account/context/accountSlice';
import {customersReducer} from 'src/features/customers/context/customersSlice';
import AsyncStorage from '@react-native-community/async-storage';
import {
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE
} from 'redux-persist';
import {startRootListener} from '../middleware/rootListener';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

const persistConfig = {
	key: 'root',
	storage: AsyncStorage
};

const rootReducer = combineReducers({
	account: accountReducer,
	customers: customersReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const listenerMiddleware = createListenerMiddleware();
const middlewares = [listenerMiddleware.middleware];

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				// ignore redux persist actions in serializable check
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
			}
		}).concat(middlewares)
});

export const persistor = persistStore(store, null, () => {});

type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startListening = listenerMiddleware.startListening as AppStartListening;
startRootListener(startListening);
