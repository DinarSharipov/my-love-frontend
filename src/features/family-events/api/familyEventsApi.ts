import { generatedApi } from '@/shared/api';

export const familyEventsApi = generatedApi.enhanceEndpoints({
  endpoints: {
    confirmFamilyEvent: { invalidatesTags: ['family events'] },
    createFamilyEvent: { invalidatesTags: ['family events'] },
    rejectFamilyEvent: { invalidatesTags: ['family events'] },
    removeFamilyEvent: { invalidatesTags: ['family events'] },
    updateFamilyEvent: { invalidatesTags: ['family events'] },
  },
});

export const {
  useConfirmFamilyEventMutation,
  useCreateFamilyEventMutation,
  useFindFamilyEventsQuery,
  useRejectFamilyEventMutation,
  useRemoveFamilyEventMutation,
  useUpdateFamilyEventMutation,
} = familyEventsApi;
