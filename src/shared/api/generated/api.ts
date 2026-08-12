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
      findUsers: build.query<FindUsersApiResponse, FindUsersApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/users`,
          params: {
            search: queryArg.search,
            page: queryArg.page,
            limit: queryArg.limit,
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
        }),
        invalidatesTags: ['family events'],
      }),
      findFamilyEvents: build.query<FindFamilyEventsApiResponse, FindFamilyEventsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events`,
          params: {
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ['family events'],
      }),
      findFamilyEventById: build.query<FindFamilyEventByIdApiResponse, FindFamilyEventByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v1/family-events/${queryArg.id}` }),
        providesTags: ['family events'],
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
export type FindUsersApiResponse = /** status 200  */ PaginatedUsersResponseDto;
export type FindUsersApiArg = {
  /** Search by first name, last name or email */
  search?: string;
  page?: Object;
  limit?: Object;
};
export type FindUserByIdApiResponse = /** status 200  */ PublicUserResponseDto;
export type FindUserByIdApiArg = {
  id: string;
};
export type FindMyFamilyApiResponse = /** status 200  */ FamilyResponseDto;
export type FindMyFamilyApiArg = void;
export type CreateFamilyInvitationApiResponse = /** status 201  */ FamilyInvitationResponseDto;
export type CreateFamilyInvitationApiArg = {
  createFamilyInvitationDto: CreateFamilyInvitationDto;
};
export type FindIncomingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindIncomingInvitationsApiArg = void;
export type FindOutgoingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindOutgoingInvitationsApiArg = void;
export type AcceptFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type AcceptFamilyInvitationApiArg = {
  id: string;
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
  createFamilyEventDto: CreateFamilyEventDto;
};
export type FindFamilyEventsApiResponse = /** status 200  */ PaginatedFamilyEventsResponseDto;
export type FindFamilyEventsApiArg = {
  /** Start date, inclusive, in APP_TIMEZONE */
  dateFrom?: string;
  /** End date, exclusive, in APP_TIMEZONE */
  dateTo?: string;
  page?: Object;
  limit?: Object;
};
export type FindFamilyEventByIdApiResponse = /** status 200  */ FamilyEventResponseDto;
export type FindFamilyEventByIdApiArg = {
  id: string;
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
  createFirstDateDto: CreateFirstDateDto;
};
export type FindMyFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type FindMyFirstDateApiArg = void;
export type UpdateFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type UpdateFirstDateApiArg = {
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
  description?: object | null;
  birthDate: string;
  phone?: object | null;
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
export type PublicUserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: object | null;
  email: string;
  /** Whether the user already belongs to a family */
  hasFamily: boolean;
};
export type PaginatedUsersResponseDto = {
  data: PublicUserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type Object = {};
export type FamilyMemberResponseDto = {
  id: string;
  joinedAt: string;
  user: UserResponseDto;
};
export type FamilyResponseDto = {
  id: string;
  createdAt: string;
  members: FamilyMemberResponseDto[];
};
export type FamilyInvitationResponseDto = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  sender: PublicUserResponseDto;
  recipient: PublicUserResponseDto;
  expiresAt: string;
  respondedAt?: object | null;
  createdAt: string;
};
export type CreateFamilyInvitationDto = {
  recipientId: string;
};
export type FamilyEventResponseDto = {
  id: string;
  familyId: string;
  name: string;
  description?: object | null;
  scheduledAt: string;
  location: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'REJECTED' | 'EVENT_DAY' | 'COMPLETED';
  proposedBy: UserResponseDto;
  respondedBy?: UserResponseDto | null;
  respondedAt?: object | null;
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
  data: FamilyEventResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type FirstDateResponseDto = {
  id: string;
  familyId: string;
  name: string;
  date: string;
  description?: object | null;
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
  useFindUsersQuery,
  useFindUserByIdQuery,
  useFindMyFamilyQuery,
  useCreateFamilyInvitationMutation,
  useFindIncomingInvitationsQuery,
  useFindOutgoingInvitationsQuery,
  useAcceptFamilyInvitationMutation,
  useRejectFamilyInvitationMutation,
  useCancelFamilyInvitationMutation,
  useCreateFamilyEventMutation,
  useFindFamilyEventsQuery,
  useFindFamilyEventByIdQuery,
  useRemoveFamilyEventMutation,
  useConfirmFamilyEventMutation,
  useRejectFamilyEventMutation,
  useCreateFirstDateMutation,
  useFindMyFirstDateQuery,
  useUpdateFirstDateMutation,
  useRemoveFirstDateMutation,
  useCheckHealthQuery,
} = injectedRtkApi;
