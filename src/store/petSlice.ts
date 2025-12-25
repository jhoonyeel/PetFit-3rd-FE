import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PetSessionState {
  selectedPetId: number | null;
}

const initialState: PetSessionState = {
  selectedPetId: null,
};

const petSlice = createSlice({
  name: 'petSession',
  initialState,
  reducers: {
    // ✅ 전용 id 저장 리듀서
    setSelectedPetId: (state, action: PayloadAction<number | null>) => {
      state.selectedPetId = action.payload;
      if (action.payload == null) {
        localStorage.removeItem('selectedPetId');
      } else {
        localStorage.setItem('selectedPetId', String(action.payload));
      }
    },
  },
});

export const { setSelectedPetId } = petSlice.actions;
export default petSlice.reducer;
