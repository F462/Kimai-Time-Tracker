import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {authorizationReducer} from '../../authorization/context/authorizationSlice';
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

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
};

const rootReducer = combineReducers({
	authorization: authorizationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				// ignore redux persist actions in serializable check
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store, null, () => {});
