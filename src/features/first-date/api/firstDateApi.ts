import { generatedApi } from '@/shared/api';

export const firstDateApi = generatedApi;

export const {
  useCreateFirstDateMutation,
  useFindMyFirstDateQuery,
  useRemoveFirstDateMutation,
  useUpdateFirstDateMutation,
} = firstDateApi;
