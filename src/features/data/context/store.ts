import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	REHYDRATE,
	persistReducer,
	persistStore
} from 'redux-persist';
import {
	TypedStartListening,
	combineReducers,
	configureStore,
	createListenerMiddleware
} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

import {accountReducer} from 'src/features/account/context/accountSlice';
import {activitiesReducer} from 'src/features/activities/context/activitiesSlice';
import {customersReducer} from 'src/features/customers/context/customersSlice';
import {projectsReducer} from 'src/features/projects/context/projectsSlice';
import {startRootListener} from '../middleware/rootListener';
import {timesheetsReducer} from 'src/features/timesheets/context/timesheetsSlice';

const persistConfig = {
	key: 'root',
	storage: AsyncStorage
};

const rootReducer = combineReducers({
	account: accountReducer,
	activities: activitiesReducer,
	customers: customersReducer,
	projects: projectsReducer,
	timesheets: timesheetsReducer
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
