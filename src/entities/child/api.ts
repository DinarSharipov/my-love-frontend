import { baseApi } from '@/shared/api/baseApi';

export type ChildProfile = {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string | null;
  birthDate: string;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ChildProfileInput = {
  firstName: string;
  lastName?: string;
  birthDate: string;
  avatarUrl?: string;
  avatarMediaId?: string | null;
};
export type ChildProfileExport = { profile: ChildProfile; tasks: unknown[]; events: unknown[] };

const childApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createChildProfile: build.mutation<ChildProfile, ChildProfileInput>({
      query: (body) => ({ url: '/api/v1/families/me/children', method: 'POST', body }),
      invalidatesTags: ['child-profiles'],
    }),
    listChildProfiles: build.query<ChildProfile[], void>({
      query: () => '/api/v1/families/me/children',
      providesTags: ['child-profiles'],
    }),
    exportChildProfile: build.query<ChildProfileExport, string>({
      query: (id) => `/api/v1/families/me/children/${id}/export`,
      providesTags: ['child-profiles'],
    }),
    updateChildProfile: build.mutation<ChildProfile, { id: string } & Partial<ChildProfileInput>>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/families/me/children/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['child-profiles'],
    }),
    deleteChildProfile: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/families/me/children/${id}`, method: 'DELETE' }),
      invalidatesTags: ['child-profiles'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateChildProfileMutation,
  useListChildProfilesQuery,
  useLazyExportChildProfileQuery,
  useUpdateChildProfileMutation,
  useDeleteChildProfileMutation,
} = childApi;
