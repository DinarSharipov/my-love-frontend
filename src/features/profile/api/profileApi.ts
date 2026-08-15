import { updateCurrentUser } from '@/entities/user';
import { generatedApi } from '@/shared/api';

export const profileApi = generatedApi.enhanceEndpoints({
  endpoints: {
    updateCurrentUser: {
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateCurrentUser(data));
        } catch {
          // The form displays request errors via unwrap().
        }
      },
    },
  },
});

export const { useFindCurrentUserQuery, useUpdateCurrentUserMutation } = profileApi;
