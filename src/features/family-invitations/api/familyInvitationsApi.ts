import { generatedApi } from '@/shared/api';

export const familyInvitationsApi = generatedApi.enhanceEndpoints({
  endpoints: {
    acceptFamilyInvitation: {
      invalidatesTags: ['family invitations', 'families', 'users'],
    },
    acceptPrivateFamilyInvitation: {
      invalidatesTags: ['family invitations', 'families', 'users'],
    },
  },
});

export const {
  useAcceptFamilyInvitationMutation,
  useAcceptPrivateFamilyInvitationMutation,
  useCancelFamilyInvitationMutation,
  useCreatePrivateFamilyInvitationMutation,
  useFindIncomingInvitationsQuery,
  useFindOutgoingInvitationsQuery,
  useFindOutgoingPrivateFamilyInvitationsQuery,
  useRejectFamilyInvitationMutation,
  useRevokePrivateFamilyInvitationMutation,
} = familyInvitationsApi;
