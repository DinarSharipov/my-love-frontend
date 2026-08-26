import { baseApi } from '@/shared/api/baseApi';

export type WellbeingScope = 'mood' | 'energy' | 'stress' | 'supportRequest';
export type WellbeingCheckIn = {
  id: string;
  ownerId: string;
  mood: number;
  energy: number;
  stress: number;
  note: string | null;
  supportRequest: boolean;
  createdAt: string;
  updatedAt: string;
};
export type WellbeingConsent = {
  id: string;
  recipientId: string;
  scopes: string[];
  expiresAt: string | null;
  revokedAt: string | null;
};
export type WellbeingAssessment = {
  id: string;
  answers: number[];
  score: number;
  createdAt: string;
};
export type WellbeingGratitude = {
  id: string;
  authorId: string;
  recipientId: string;
  message: string;
  createdAt: string;
};
export type WellbeingSupportRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  message: string | null;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};
export type WellbeingRitual = {
  id: string;
  familyId: string;
  createdById: string;
  title: string;
  description: string | null;
  cadence: string;
  nextAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type WellbeingCoupleMeeting = {
  id: string;
  familyId: string;
  createdById: string;
  title: string;
  scheduledAt: string;
  sections: string[];
  responses: Record<string, string>;
  publishedAt: string | null;
  sharedDecision: string | null;
  createdAt: string;
  updatedAt: string;
};

const wellbeingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createWellbeingCheckIn: build.mutation<
      WellbeingCheckIn,
      { mood: number; energy: number; stress: number; note?: string; supportRequest?: boolean }
    >({
      query: (body) => ({ url: '/api/v1/families/me/wellbeing/check-ins', method: 'POST', body }),
    }),
    listWellbeingCheckIns: build.query<WellbeingCheckIn[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins',
      providesTags: ['wellbeing'],
    }),
    getWellbeingCheckIn: build.query<WellbeingCheckIn, string>({
      query: (id) => `/api/v1/families/me/wellbeing/check-ins/${id}`,
    }),
    deleteWellbeingCheckIn: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/families/me/wellbeing/check-ins/${id}`, method: 'DELETE' }),
    }),
    grantWellbeingConsent: build.mutation<
      WellbeingConsent,
      { recipientId: string; scopes: WellbeingScope[]; expiresAt?: string }
    >({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/consents',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingConsents: build.query<WellbeingConsent[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/consents',
      providesTags: ['wellbeing'],
    }),
    revokeWellbeingConsent: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/consents/${id}`,
        method: 'DELETE',
      }),
    }),
    listSharedWellbeingCheckIns: build.query<WellbeingCheckIn[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/shared-with-me',
      providesTags: ['wellbeing'],
    }),
    createWellbeingAssessment: build.mutation<WellbeingAssessment, { answers: number[] }>({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/assessments',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingAssessments: build.query<WellbeingAssessment[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/assessments',
      providesTags: ['wellbeing'],
    }),
    getWellbeingTrends: build.query<Record<string, unknown>, void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/trends',
      providesTags: ['wellbeing'],
    }),
    exportWellbeingData: build.query<Record<string, unknown>, void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/export',
    }),
    deleteAllWellbeingData: build.mutation<void, void>({
      query: () => ({ url: '/api/v1/families/me/wellbeing/check-ins', method: 'DELETE' }),
      invalidatesTags: ['wellbeing'],
    }),
    createWellbeingGratitude: build.mutation<
      WellbeingGratitude,
      { recipientId: string; message: string }
    >({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/gratitudes',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingGratitudes: build.query<WellbeingGratitude[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/gratitudes',
      providesTags: ['wellbeing'],
    }),
    deleteWellbeingGratitude: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/gratitudes/${id}`,
        method: 'DELETE',
      }),
    }),
    createWellbeingSupportRequest: build.mutation<
      WellbeingSupportRequest,
      { recipientId: string; message?: string }
    >({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/support-requests',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingSupportRequests: build.query<WellbeingSupportRequest[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/support-requests',
      providesTags: ['wellbeing'],
    }),
    updateWellbeingSupportRequest: build.mutation<
      WellbeingSupportRequest,
      { id: string; status: WellbeingSupportRequest['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/support-requests/${id}/status`,
        method: 'POST',
        body: { status },
      }),
    }),
    createWellbeingRitual: build.mutation<
      WellbeingRitual,
      { title: string; description?: string; cadence: string; nextAt: string }
    >({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/rituals',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingRituals: build.query<WellbeingRitual[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/rituals',
      providesTags: ['wellbeing'],
    }),
    updateWellbeingRitual: build.mutation<
      WellbeingRitual,
      {
        id: string;
        title?: string;
        description?: string;
        cadence?: string;
        nextAt?: string;
        isActive?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/rituals/${id}`,
        method: 'POST',
        body,
      }),
    }),
    deleteWellbeingRitual: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/rituals/${id}`,
        method: 'DELETE',
      }),
    }),
    createWellbeingCoupleMeeting: build.mutation<
      WellbeingCoupleMeeting,
      { title: string; scheduledAt: string; sections: string[] }
    >({
      query: (body) => ({
        url: '/api/v1/families/me/wellbeing/check-ins/couple-meetings',
        method: 'POST',
        body,
      }),
    }),
    listWellbeingCoupleMeetings: build.query<WellbeingCoupleMeeting[], void>({
      query: () => '/api/v1/families/me/wellbeing/check-ins/couple-meetings',
      providesTags: ['wellbeing'],
    }),
    updateWellbeingCoupleMeeting: build.mutation<
      WellbeingCoupleMeeting,
      { id: string; title?: string; scheduledAt?: string; sections?: string[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${id}`,
        method: 'POST',
        body,
      }),
    }),
    respondToWellbeingCoupleMeeting: build.mutation<
      WellbeingCoupleMeeting,
      { id: string; response: string }
    >({
      query: ({ id, response }) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${id}/response`,
        method: 'POST',
        body: { response },
      }),
    }),
    publishWellbeingCoupleMeeting: build.mutation<WellbeingCoupleMeeting, string>({
      query: (id) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${id}/publish`,
        method: 'POST',
      }),
    }),
    setWellbeingCoupleMeetingDecision: build.mutation<
      WellbeingCoupleMeeting,
      { id: string; decision: string }
    >({
      query: ({ id, decision }) => ({
        url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${id}/decision`,
        method: 'POST',
        body: { decision },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateWellbeingCheckInMutation,
  useListWellbeingCheckInsQuery,
  useGetWellbeingCheckInQuery,
  useDeleteWellbeingCheckInMutation,
  useGrantWellbeingConsentMutation,
  useListWellbeingConsentsQuery,
  useRevokeWellbeingConsentMutation,
  useListSharedWellbeingCheckInsQuery,
  useCreateWellbeingAssessmentMutation,
  useListWellbeingAssessmentsQuery,
  useGetWellbeingTrendsQuery,
  useLazyExportWellbeingDataQuery,
  useDeleteAllWellbeingDataMutation,
  useCreateWellbeingGratitudeMutation,
  useListWellbeingGratitudesQuery,
  useDeleteWellbeingGratitudeMutation,
  useCreateWellbeingSupportRequestMutation,
  useListWellbeingSupportRequestsQuery,
  useUpdateWellbeingSupportRequestMutation,
  useCreateWellbeingRitualMutation,
  useListWellbeingRitualsQuery,
  useUpdateWellbeingRitualMutation,
  useDeleteWellbeingRitualMutation,
  useCreateWellbeingCoupleMeetingMutation,
  useListWellbeingCoupleMeetingsQuery,
  useUpdateWellbeingCoupleMeetingMutation,
  useRespondToWellbeingCoupleMeetingMutation,
  usePublishWellbeingCoupleMeetingMutation,
  useSetWellbeingCoupleMeetingDecisionMutation,
} = wellbeingApi;
