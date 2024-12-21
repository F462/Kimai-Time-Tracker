import {store} from './context/store';

export type RootState = ReturnType<typeof store.getState>;
