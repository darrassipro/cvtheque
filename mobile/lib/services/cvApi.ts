import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../api/baseQuery';

interface CVListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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
  }),
});

export const {
  useListCVsQuery,
  useGetCVByIdQuery,
  useGetCVExtractedDataQuery,
  useUploadCVMutation,
  useDeleteCVMutation,
} = cvApi;
