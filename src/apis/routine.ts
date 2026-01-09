import { axiosInstance } from './axiosInstance';

export const getDailyRoutine = async (petId: number, date: string) => {
  const response = await axiosInstance.get(`routines/${petId}/daily/${date}`);
  return response.data.content;
};

export const checkRoutine = async (petId: number, date: string, category: string) => {
  try {
    await axiosInstance.post(`routines/${petId}/${date}/${category}/check`);
  } catch (error) {
    console.log('check routine failed', error);
    throw error;
  }
};

export const uncheckRoutine = async (petId: number, date: string, category: string) => {
  try {
    await axiosInstance.delete(`routines/${petId}/${date}/${category}/uncheck`);
  } catch (error) {
    console.log('unchecked routine failed', error);
    throw error;
  }
};

interface MemoRoutineBody {
  actualAmount?: number;
  content?: string | null;
}

export const memoRoutine = async (
  petId: number,
  date: string,
  category: string,
  body: MemoRoutineBody
) => {
  try {
    await axiosInstance.post(`routines/${petId}/${date}/${category}/memo`, body);
  } catch (error) {
    console.log('memo routine failed', error);
    throw error;
  }
};
