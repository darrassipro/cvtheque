import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../api/baseQuery';

interface CVListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: 'USER_UPLOAD' | 'SUPERADMIN_BULK'; // Filter by upload source (superadmin only)
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface BulkUploadResult {
  total: number;
  queued: number;
  failed: number;
  results: Array<{ fileName: string; cvId?: string; status: string; error?: string }>;
}

interface AssignCVsPayload {
  consultantId: string;
  assignmentType: 'cv' | 'user-profile';
  cvIds?: string[];
  userIds?: string[];
  name?: string;
  description?: string;
  expiresAt?: string;
}

export const cvApi = createApi({
  reducerPath: 'cvApi',
  baseQuery,
  tagTypes: ['CVs', 'CV'],
  endpoints: (builder) => ({
    listCVs: builder.query({
      query: (params: CVListParams = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.source) queryParams.append('source', params.source);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        return `/api/cvs?${queryParams.toString()}`;
      },
      providesTags: ['CVs'],
    }),
    getCVById: builder.query({
      query: (id: string) => `/api/cvs/${id}`,
      providesTags: (result, error, id) => [{ type: 'CV', id }],
    }),
    getCVExtractedData: builder.query({
      query: (id: string) => `/api/cvs/${id}/extracted-data`,
    }),
    getSharedWithMe: builder.query({
      query: () => '/api/cvs/shared-with-me',
      providesTags: ['CVs'],
    }),
    getSharedByMe: builder.query({
      query: () => '/api/cvs/shared-by-me',
      providesTags: ['CVs'],
    }),
    shareWithConsultant: builder.mutation({
      query: (body: { consultantId: string; cvIds: string[]; name?: string; description?: string; expiresAt?: string }) => ({
        url: '/api/cvs/share/consultant',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CVs'],
    }),
    uploadCV: builder.mutation({
      query: (formData: FormData) => ({
        url: '/api/cvs/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CVs'],
    }),
    deleteCV: builder.mutation({
      query: (id: string) => ({
        url: `/api/cvs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CVs'],
    }),
    // Superadmin endpoints
    bulkUploadCVs: builder.mutation<BulkUploadResult, FormData>({
      query: (formData: FormData) => ({
        url: '/api/cvs/bulk-upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['CVs'],
    }),
    updateCVExtractedData: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/api/cvs/${id}/extracted-data`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CV', id }, 'CVs'],
    }),
    assignCVsToConsultant: builder.mutation<any, AssignCVsPayload>({
      query: (body) => ({
        url: '/api/cvs/assign-to-consultant',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CVs'],
    }),
  }),
});

export const {
  useListCVsQuery,
  useGetCVByIdQuery,
  useGetCVExtractedDataQuery,
  useGetSharedWithMeQuery,
  useGetSharedByMeQuery,
  useShareWithConsultantMutation,
  useUploadCVMutation,
  useDeleteCVMutation,
  // Superadmin hooks
  useBulkUploadCVsMutation,
  useUpdateCVExtractedDataMutation,
  useAssignCVsToConsultantMutation,
} = cvApi;
