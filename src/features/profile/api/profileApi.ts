import { updateCurrentUser } from '@/entities/user';
import { generatedApi, type UserResponseDto } from '@/shared/api';

export const profileApi = generatedApi
  .enhanceEndpoints({
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
  })
  .injectEndpoints({
    endpoints: (build) => ({
      uploadAvatarFile: build.mutation<UserResponseDto, File>({
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(updateCurrentUser(data));
            dispatch(
              generatedApi.util.updateQueryData('findCurrentUser', undefined, (currentUser) => {
                Object.assign(currentUser, data);
              }),
            );
          } catch {
            // The avatar UI displays request errors via unwrap().
          }
        },
        invalidatesTags: ['users'],
        query: (file) => {
          const body = new FormData();
          body.append('file', file);

          return {
            body,
            method: 'POST',
            url: '/api/v1/users/me/avatar',
          };
        },
      }),
    }),
  });

export const {
  useFindCurrentUserQuery,
  useRemoveAvatarMutation,
  useUpdateCurrentUserMutation,
  useUploadAvatarFileMutation,
} = profileApi;
