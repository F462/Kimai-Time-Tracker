import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	combineReducers,
	configureStore,
	createListenerMiddleware,
	TypedStartListening,
	UnknownAction,
} from '@reduxjs/toolkit';
// it is needed to be imported here for the actual definition
// eslint-disable-next-line no-restricted-imports
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
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

import {userLoggedOut} from 'src/features/account/context/accountActions';
import {accountReducer} from 'src/features/account/context/accountSlice';
import {activeTimesheetReducer} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {activitiesReducer} from 'src/features/activities/context/activitiesSlice';
import {appStateReducer} from 'src/features/appState/context/appStateSlice';
import {customersReducer} from 'src/features/customers/context/customersSlice';
import {createLoggingMiddleware} from 'src/features/logging/middleware/middleware';
import {networkReducer} from 'src/features/network/context/networkSlice';
import {onboardingReducer} from 'src/features/onboarding/context/onboardingSlice';
import {overviewReducer} from 'src/features/overview/context/overviewSlice';
import {projectsReducer} from 'src/features/projects/context/projectsSlice';
import {settingsReducer} from 'src/features/settings/context/settingsSlice';
import {ResetSyncStateTransform} from 'src/features/synchronization/context/ResetSyncStateTransform';
import {synchronizationReducer} from 'src/features/synchronization/context/synchronizationSlice';
import {
	timesheetsReducer,
	timesheetsUpdated,
} from 'src/features/timesheets/context/timesheetsSlice';
import {startRootListener} from '../middleware/rootListener';

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
	// The overview is derived from the timesheets and the settings, so it is
	// not persisted; it is re-calculated from the persisted timesheets on
	// start-up.
	blacklist: ['appState', 'network', 'overview'],
	transforms: [ResetSyncStateTransform],
};

const appReducer = combineReducers({
	account: accountReducer,
	activeTimesheet: activeTimesheetReducer,
	activities: activitiesReducer,
	appState: appStateReducer,
	customers: customersReducer,
	network: networkReducer,
	onboarding: onboardingReducer,
	overview: overviewReducer,
	projects: projectsReducer,
	settings: settingsReducer,
	synchronization: synchronizationReducer,
	timesheets: timesheetsReducer,
});

const rootReducer = (
	state: ReturnType<typeof appReducer> | undefined,
	action: UnknownAction,
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
		ignoredPayload: [timesheetsUpdated.type],
	}),
	listenerMiddleware.middleware,
];

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// ignore redux persist actions in serializable check
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(middlewares),
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
