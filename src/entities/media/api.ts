import { generatedApi } from '@/shared/api/generated/api';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type Media = {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  kind?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
  previewUrl?: unknown | null;
};

export type MediaUploadInit = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export type MediaUploadInitResponse = {
  sessionId: string;
  objectKey: string;
  partSizeBytes: number;
  parts: Array<{ partNumber: number; url: string }>;
  expiresAt: string;
};

export type MediaUploadStatus = {
  status: 'INITIATED' | 'COMPLETED' | 'ABORTED';
  uploadedBytes: number;
  totalBytes: number;
};

type QueryBase = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

const getError = (message: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: message,
});

export const mediaUploadApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    mediaUpload: build.mutation<Media, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/api/v1/media/upload', method: 'POST', body };
      },
      invalidatesTags: ['media'],
    }),
    mediaUploadDirect: build.mutation<Media, File>({
      async queryFn(file, api, extraOptions, baseQuery: QueryBase) {
        const initResult = await baseQuery(
          {
            url: '/api/v1/media/uploads/initiate',
            method: 'POST',
            body: {
              originalName: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
            } satisfies MediaUploadInit,
          },
          api,
          extraOptions,
        );
        if (initResult.error) return { error: initResult.error };

        const session = initResult.data as MediaUploadInitResponse;
        const uploadedParts: Array<{ partNumber: number; etag: string }> = [];
        try {
          const parts = await Promise.all(
            session.parts.map(async (part) => {
              const start = (part.partNumber - 1) * session.partSizeBytes;
              const response = await fetch(part.url, {
                method: 'PUT',
                body: file.slice(start, Math.min(start + session.partSizeBytes, file.size)),
              });
              if (!response.ok) throw new Error(`Part upload failed: ${response.status}`);
              const etag = response.headers.get('ETag');
              if (!etag) throw new Error('S3 did not return an ETag');
              return { partNumber: part.partNumber, etag: etag.replaceAll('"', '') };
            }),
          );
          uploadedParts.push(...parts);
        } catch (error) {
          await baseQuery(
            { url: `/api/v1/media/uploads/${session.sessionId}`, method: 'DELETE' },
            api,
            extraOptions,
          );
          return { error: getError(error instanceof Error ? error.message : 'Part upload failed') };
        }

        const completeResult = await baseQuery(
          {
            url: `/api/v1/media/uploads/${session.sessionId}/complete`,
            method: 'POST',
            body: { parts: uploadedParts },
          },
          api,
          extraOptions,
        );
        if (completeResult.error) return { error: completeResult.error };
        return { data: completeResult.data as Media };
      },
      invalidatesTags: ['media'],
    }),
    mediaUploadStatus: build.query<MediaUploadStatus, string>({
      query: (sessionId) => `/api/v1/media/uploads/${sessionId}/status`,
    }),
    mediaUploadAbort: build.mutation<{ aborted: true }, string>({
      query: (sessionId) => ({ url: `/api/v1/media/uploads/${sessionId}`, method: 'DELETE' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useMediaUploadMutation,
  useMediaUploadDirectMutation,
  useLazyMediaUploadStatusQuery,
  useMediaUploadAbortMutation,
} = mediaUploadApi;
