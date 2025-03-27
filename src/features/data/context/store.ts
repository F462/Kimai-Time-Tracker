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
	UnknownAction,
	combineReducers,
	configureStore,
	createListenerMiddleware
} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

import {
	timesheetsReducer,
	timesheetsUpdated
} from 'src/features/timesheets/context/timesheetsSlice';
import {accountReducer} from 'src/features/account/context/accountSlice';
import {activeTimesheetReducer} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {activitiesReducer} from 'src/features/activities/context/activitiesSlice';
import {appStateReducer} from 'src/features/appState/context/appStateSlice';
import {customersReducer} from 'src/features/customers/context/customersSlice';
import {networkReducer} from 'src/features/network/context/networkSlice';
import {onboardingReducer} from 'src/features/onboarding/context/onboardingSlice';
import {projectsReducer} from 'src/features/projects/context/projectsSlice';
import {startRootListener} from '../middleware/rootListener';
import {synchronizationReducer} from 'src/features/synchronization/context/synchronizationSlice';
import {userLoggedOut} from 'src/features/account/context/accountActions';

import {ResetSyncStateTransform} from 'src/features/synchronization/context/ResetSyncStateTransform';
import {createLoggingMiddleware} from 'src/features/logging/middleware/middleware';

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
	blacklist: ['appState', 'network'],
	transforms: [ResetSyncStateTransform]
};

const appReducer = combineReducers({
	account: accountReducer,
	activeTimesheet: activeTimesheetReducer,
	activities: activitiesReducer,
	appState: appStateReducer,
	customers: customersReducer,
	network: networkReducer,
	onboarding: onboardingReducer,
	projects: projectsReducer,
	synchronization: synchronizationReducer,
	timesheets: timesheetsReducer
});

const rootReducer = (
	state: ReturnType<typeof appReducer> | undefined,
	action: UnknownAction
) => {
	if (action.type === userLoggedOut.type) {
		return appReducer(undefined, action);
	}

	return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const listenerMiddleware = createListenerMiddleware();
const middlewares = [
	createLoggingMiddleware({
		ignoredPayload: [timesheetsUpdated.type]
	}),
	listenerMiddleware.middleware
];

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
