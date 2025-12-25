import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import petReducer from './petSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    petSession: petReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
