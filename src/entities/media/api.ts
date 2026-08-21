import { generatedApi } from '@/shared/api/generated/api';

type MediaUploadResponse = {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
};

export const mediaUploadApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    mediaUpload: build.mutation<MediaUploadResponse, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/api/v1/media/upload', method: 'POST', body };
      },
      invalidatesTags: ['media'],
    }),
  }),
  overrideExisting: false,
});

export const { useMediaUploadMutation } = mediaUploadApi;
