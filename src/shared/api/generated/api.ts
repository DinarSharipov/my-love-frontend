import { baseApi as api } from '@/shared/api/baseApi';
export const addTagTypes = [
  'auth',
  'users',
  'families',
  'family invitations',
  'family events',
  'first date',
  'health',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      register: build.mutation<RegisterApiResponse, RegisterApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/register`,
          method: 'POST',
          body: queryArg.registerDto,
        }),
        invalidatesTags: ['auth'],
      }),
      login: build.mutation<LoginApiResponse, LoginApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: 'POST',
          body: queryArg.loginDto,
        }),
        invalidatesTags: ['auth'],
      }),
      logout: build.mutation<LogoutApiResponse, LogoutApiArg>({
        query: () => ({ url: `/api/v1/auth/logout`, method: 'POST' }),
        invalidatesTags: ['auth'],
      }),
      requestPasswordReset: build.mutation<
        RequestPasswordResetApiResponse,
        RequestPasswordResetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/password-reset/request`,
          method: 'POST',
          body: queryArg.requestPasswordResetDto,
        }),
        invalidatesTags: ['auth'],
      }),
      resetPassword: build.mutation<ResetPasswordApiResponse, ResetPasswordApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/password-reset/confirm`,
          method: 'POST',
          body: queryArg.resetPasswordDto,
        }),
        invalidatesTags: ['auth'],
      }),
      listSessions: build.query<ListSessionsApiResponse, ListSessionsApiArg>({
        query: () => ({ url: `/api/v1/auth/sessions` }),
        providesTags: ['auth'],
      }),
      revokeOtherSessions: build.mutation<
        RevokeOtherSessionsApiResponse,
        RevokeOtherSessionsApiArg
      >({
        query: () => ({ url: `/api/v1/auth/sessions/others`, method: 'DELETE' }),
        invalidatesTags: ['auth'],
      }),
      revokeSession: build.mutation<RevokeSessionApiResponse, RevokeSessionApiArg>({
        query: (queryArg) => ({ url: `/api/v1/auth/sessions/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['auth'],
      }),
      changePassword: build.mutation<ChangePasswordApiResponse, ChangePasswordApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/password`,
          method: 'PATCH',
          body: queryArg.changePasswordDto,
        }),
        invalidatesTags: ['auth'],
      }),
      findCurrentUser: build.query<FindCurrentUserApiResponse, FindCurrentUserApiArg>({
        query: () => ({ url: `/api/v1/users/me` }),
        providesTags: ['users'],
      }),
      updateCurrentUser: build.mutation<UpdateCurrentUserApiResponse, UpdateCurrentUserApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/users/me`,
          method: 'PATCH',
          body: queryArg.updateCurrentUserDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['users'],
      }),
      findUsers: build.query<FindUsersApiResponse, FindUsersApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/users`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            search: queryArg.search,
          },
        }),
        providesTags: ['users'],
      }),
      findUserById: build.query<FindUserByIdApiResponse, FindUserByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.id}` }),
        providesTags: ['users'],
      }),
      findMyFamily: build.query<FindMyFamilyApiResponse, FindMyFamilyApiArg>({
        query: () => ({ url: `/api/v1/families/me` }),
        providesTags: ['families'],
      }),
      createFamilyInvitation: build.mutation<
        CreateFamilyInvitationApiResponse,
        CreateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations`,
          method: 'POST',
          body: queryArg.createFamilyInvitationDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      createPrivateFamilyInvitation: build.mutation<
        CreatePrivateFamilyInvitationApiResponse,
        CreatePrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private`,
          method: 'POST',
          body: queryArg.createPrivateFamilyInvitationDto,
        }),
        invalidatesTags: ['family invitations'],
      }),
      findOutgoingPrivateFamilyInvitations: build.query<
        FindOutgoingPrivateFamilyInvitationsApiResponse,
        FindOutgoingPrivateFamilyInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/private/outgoing` }),
        providesTags: ['family invitations'],
      }),
      acceptPrivateFamilyInvitation: build.mutation<
        AcceptPrivateFamilyInvitationApiResponse,
        AcceptPrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private/accept`,
          method: 'POST',
          body: queryArg.acceptPrivateFamilyInvitationDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      revokePrivateFamilyInvitation: build.mutation<
        RevokePrivateFamilyInvitationApiResponse,
        RevokePrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private/${queryArg.id}/revoke`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      findIncomingInvitations: build.query<
        FindIncomingInvitationsApiResponse,
        FindIncomingInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/incoming` }),
        providesTags: ['family invitations'],
      }),
      findOutgoingInvitations: build.query<
        FindOutgoingInvitationsApiResponse,
        FindOutgoingInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/outgoing` }),
        providesTags: ['family invitations'],
      }),
      acceptFamilyInvitation: build.mutation<
        AcceptFamilyInvitationApiResponse,
        AcceptFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/accept`,
          method: 'PATCH',
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      rejectFamilyInvitation: build.mutation<
        RejectFamilyInvitationApiResponse,
        RejectFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/reject`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      cancelFamilyInvitation: build.mutation<
        CancelFamilyInvitationApiResponse,
        CancelFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/cancel`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      createFamilyEvent: build.mutation<CreateFamilyEventApiResponse, CreateFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events`,
          method: 'POST',
          body: queryArg.createFamilyEventDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family events'],
      }),
      findFamilyEvents: build.query<FindFamilyEventsApiResponse, FindFamilyEventsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ['family events'],
      }),
      findFamilyEventById: build.query<FindFamilyEventByIdApiResponse, FindFamilyEventByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v1/family-events/${queryArg.id}` }),
        providesTags: ['family events'],
      }),
      updateFamilyEvent: build.mutation<UpdateFamilyEventApiResponse, UpdateFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateFamilyEventDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['family events'],
      }),
      removeFamilyEvent: build.mutation<RemoveFamilyEventApiResponse, RemoveFamilyEventApiArg>({
        query: (queryArg) => ({ url: `/api/v1/family-events/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['family events'],
      }),
      confirmFamilyEvent: build.mutation<ConfirmFamilyEventApiResponse, ConfirmFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}/confirm`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family events'],
      }),
      rejectFamilyEvent: build.mutation<RejectFamilyEventApiResponse, RejectFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}/reject`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family events'],
      }),
      createFirstDate: build.mutation<CreateFirstDateApiResponse, CreateFirstDateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/first-date`,
          method: 'POST',
          body: queryArg.createFirstDateDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['first date'],
      }),
      findMyFirstDate: build.query<FindMyFirstDateApiResponse, FindMyFirstDateApiArg>({
        query: () => ({ url: `/api/v1/first-date` }),
        providesTags: ['first date'],
      }),
      updateFirstDate: build.mutation<UpdateFirstDateApiResponse, UpdateFirstDateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/first-date`,
          method: 'PATCH',
          body: queryArg.updateFirstDateDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['first date'],
      }),
      removeFirstDate: build.mutation<RemoveFirstDateApiResponse, RemoveFirstDateApiArg>({
        query: () => ({ url: `/api/v1/first-date`, method: 'DELETE' }),
        invalidatesTags: ['first date'],
      }),
      checkHealth: build.query<CheckHealthApiResponse, CheckHealthApiArg>({
        query: () => ({ url: `/api/v1/health` }),
        providesTags: ['health'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type RegisterApiResponse = /** status 201  */ AuthResponseDto;
export type RegisterApiArg = {
  registerDto: RegisterDto;
};
export type LoginApiResponse = /** status 200  */ AuthResponseDto;
export type LoginApiArg = {
  loginDto: LoginDto;
};
export type LogoutApiResponse = unknown;
export type LogoutApiArg = void;
export type RequestPasswordResetApiResponse = /** status 202  */ PasswordResetRequestResponseDto;
export type RequestPasswordResetApiArg = {
  requestPasswordResetDto: RequestPasswordResetDto;
};
export type ResetPasswordApiResponse = unknown;
export type ResetPasswordApiArg = {
  resetPasswordDto: ResetPasswordDto;
};
export type ListSessionsApiResponse = /** status 200  */ AuthSessionResponseDto[];
export type ListSessionsApiArg = void;
export type RevokeOtherSessionsApiResponse = unknown;
export type RevokeOtherSessionsApiArg = void;
export type RevokeSessionApiResponse = unknown;
export type RevokeSessionApiArg = {
  id: string;
};
export type ChangePasswordApiResponse = unknown;
export type ChangePasswordApiArg = {
  changePasswordDto: ChangePasswordDto;
};
export type FindCurrentUserApiResponse = /** status 200  */ UserResponseDto;
export type FindCurrentUserApiArg = void;
export type UpdateCurrentUserApiResponse = /** status 200  */ UserResponseDto;
export type UpdateCurrentUserApiArg = {
  /** Optional current profile version */
  'If-Match'?: string;
  updateCurrentUserDto: UpdateCurrentUserDto;
};
export type FindUsersApiResponse = /** status 200  */ PaginatedUsersResponseDto;
export type FindUsersApiArg = {
  page?: number;
  limit?: number;
  /** Search by first name, last name or email */
  search?: string;
};
export type FindUserByIdApiResponse = /** status 200  */ PublicUserResponseDto;
export type FindUserByIdApiArg = {
  id: string;
};
export type FindMyFamilyApiResponse = /** status 200  */ FamilyResponseDto;
export type FindMyFamilyApiArg = void;
export type CreateFamilyInvitationApiResponse = /** status 201  */ FamilyInvitationResponseDto;
export type CreateFamilyInvitationApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFamilyInvitationDto: CreateFamilyInvitationDto;
};
export type CreatePrivateFamilyInvitationApiResponse =
  /** status 201  */ CreatedPrivateFamilyInvitationResponseDto;
export type CreatePrivateFamilyInvitationApiArg = {
  createPrivateFamilyInvitationDto: CreatePrivateFamilyInvitationDto;
};
export type FindOutgoingPrivateFamilyInvitationsApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto[];
export type FindOutgoingPrivateFamilyInvitationsApiArg = void;
export type AcceptPrivateFamilyInvitationApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto;
export type AcceptPrivateFamilyInvitationApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  acceptPrivateFamilyInvitationDto: AcceptPrivateFamilyInvitationDto;
};
export type RevokePrivateFamilyInvitationApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto;
export type RevokePrivateFamilyInvitationApiArg = {
  id: string;
};
export type FindIncomingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindIncomingInvitationsApiArg = void;
export type FindOutgoingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindOutgoingInvitationsApiArg = void;
export type AcceptFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type AcceptFamilyInvitationApiArg = {
  id: string;
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
};
export type RejectFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type RejectFamilyInvitationApiArg = {
  id: string;
};
export type CancelFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type CancelFamilyInvitationApiArg = {
  id: string;
};
export type CreateFamilyEventApiResponse = /** status 201  */ FamilyEventResponseDto;
export type CreateFamilyEventApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFamilyEventDto: CreateFamilyEventDto;
};
export type FindFamilyEventsApiResponse = /** status 200  */ PaginatedFamilyEventsResponseDto;
export type FindFamilyEventsApiArg = {
  page?: number;
  limit?: number;
  /** Start date, inclusive, in the family timezone */
  dateFrom?: string;
  /** End date, exclusive, in the family timezone */
  dateTo?: string;
};
export type FindFamilyEventByIdApiResponse = /** status 200  */ FamilyEventResponseDto;
export type FindFamilyEventByIdApiArg = {
  id: string;
};
export type UpdateFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type UpdateFamilyEventApiArg = {
  id: string;
  /** Current resource version. Omit for backward-compatible last-write-wins behavior. */
  'If-Match'?: string;
  updateFamilyEventDto: UpdateFamilyEventDto;
};
export type RemoveFamilyEventApiResponse = unknown;
export type RemoveFamilyEventApiArg = {
  id: string;
};
export type ConfirmFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type ConfirmFamilyEventApiArg = {
  id: string;
};
export type RejectFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type RejectFamilyEventApiArg = {
  id: string;
};
export type CreateFirstDateApiResponse = /** status 201  */ FirstDateResponseDto;
export type CreateFirstDateApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFirstDateDto: CreateFirstDateDto;
};
export type FindMyFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type FindMyFirstDateApiArg = void;
export type UpdateFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type UpdateFirstDateApiArg = {
  /** Current resource version. Omit for backward-compatible last-write-wins behavior. */
  'If-Match'?: string;
  updateFirstDateDto: UpdateFirstDateDto;
};
export type RemoveFirstDateApiResponse = unknown;
export type RemoveFirstDateApiArg = void;
export type CheckHealthApiResponse = /** status 200  */ any;
export type CheckHealthApiArg = void;
export type UserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  birthDate: string;
  phone?: string | null;
  locale: string;
  timeZone: string;
  version: number;
  createdAt: string;
};
export type AuthResponseDto = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDto;
};
export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string;
  birthDate: string;
  phone?: string;
};
export type LoginDto = {
  email: string;
  password: string;
};
export type PasswordResetRequestResponseDto = {
  message: string;
};
export type RequestPasswordResetDto = {
  email: string;
};
export type ResetPasswordDto = {
  /** One-time token from the password reset link */
  token: string;
  newPassword: string;
};
export type AuthSessionResponseDto = {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
};
export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};
export type UpdateCurrentUserDto = {
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  phone?: string | null;
  locale?: string;
  timeZone?: string;
};
export type PublicUserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  email: string;
  /** Whether the user already belongs to a family */
  hasFamily: boolean;
};
export type PaginatedUsersResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PublicUserResponseDto[];
};
export type FamilyMemberResponseDto = {
  id: string;
  role: 'PARTNER' | 'CHILD';
  joinedAt: string;
  user: UserResponseDto;
};
export type FamilyResponseDto = {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DISSOLVED';
  timeZone: string;
  locale: string;
  defaultCurrency: string;
  createdAt: string;
  members: FamilyMemberResponseDto[];
};
export type FamilyInvitationResponseDto = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  sender: PublicUserResponseDto;
  recipient: PublicUserResponseDto;
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
};
export type CreateFamilyInvitationDto = {
  recipientId: string;
};
export type CreatedPrivateFamilyInvitationResponseDto = {
  id: string;
  recipientEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
  /** Shown only in the create response. Share it directly with the intended partner. */
  inviteUrl: string;
};
export type CreatePrivateFamilyInvitationDto = {
  recipientEmail: string;
};
export type PrivateFamilyInvitationResponseDto = {
  id: string;
  recipientEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
};
export type AcceptPrivateFamilyInvitationDto = {
  /** One-time token from the invitation link */
  token: string;
};
export type FamilyEventResponseDto = {
  id: string;
  familyId: string;
  name: string;
  description?: string | null;
  scheduledAt: string;
  location: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'REJECTED' | 'EVENT_DAY' | 'COMPLETED';
  proposedBy: UserResponseDto;
  respondedBy?: UserResponseDto | null;
  respondedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateFamilyEventDto = {
  name: string;
  description?: string;
  /** Event date and time in ISO 8601 format */
  scheduledAt: string;
  location: string;
};
export type PaginatedFamilyEventsResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: FamilyEventResponseDto[];
};
export type UpdateFamilyEventDto = {
  name?: string;
  description?: string;
  /** Event date and time in ISO 8601 format */
  scheduledAt?: string;
  location?: string;
};
export type FirstDateResponseDto = {
  id: string;
  familyId: string;
  name: string;
  date: string;
  description?: string | null;
  version: number;
  createdBy: UserResponseDto;
  createdAt: string;
  updatedAt: string;
};
export type CreateFirstDateDto = {
  name: string;
  date: string;
  description?: string;
};
export type UpdateFirstDateDto = {
  name?: string;
  date?: string;
  description?: string;
};
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useListSessionsQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
  useChangePasswordMutation,
  useFindCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useFindUsersQuery,
  useFindUserByIdQuery,
  useFindMyFamilyQuery,
  useCreateFamilyInvitationMutation,
  useCreatePrivateFamilyInvitationMutation,
  useFindOutgoingPrivateFamilyInvitationsQuery,
  useAcceptPrivateFamilyInvitationMutation,
  useRevokePrivateFamilyInvitationMutation,
  useFindIncomingInvitationsQuery,
  useFindOutgoingInvitationsQuery,
  useAcceptFamilyInvitationMutation,
  useRejectFamilyInvitationMutation,
  useCancelFamilyInvitationMutation,
  useCreateFamilyEventMutation,
  useFindFamilyEventsQuery,
  useFindFamilyEventByIdQuery,
  useUpdateFamilyEventMutation,
  useRemoveFamilyEventMutation,
  useConfirmFamilyEventMutation,
  useRejectFamilyEventMutation,
  useCreateFirstDateMutation,
  useFindMyFirstDateQuery,
  useUpdateFirstDateMutation,
  useRemoveFirstDateMutation,
  useCheckHealthQuery,
} = injectedRtkApi;
