import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import { CV, CVListParams, CVListResponse, CVExtractedData } from "@/types/cv.types";

export const cvApi = createApi({
  reducerPath: "cvApi",
  baseQuery: baseQuery,
  tagTypes: ['CV', 'CVs', 'CVExtractedData'],
  endpoints: (builder) => ({
    uploadCV: builder.mutation<{ success: boolean; message: string; data: CV }, FormData>({
      query: (formData) => ({
        url: "/api/cvs/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['CVs'],
    }),

    listCVs: builder.query<CVListResponse, CVListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.page) queryParams.append('page', params.page.toString());
        if (params && params.limit) queryParams.append('limit', params.limit.toString());
        if (params && params.search) queryParams.append('search', params.search);
        if (params && params.status) queryParams.append('status', params.status);
        if (params && params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params && params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params && params.userId) queryParams.append('userId', params.userId);

        return {
          url: `/api/cvs?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['CVs'],
    }),

    getCVById: builder.query<{ success: boolean; data: CV }, string>({
      query: (id) => ({
        url: `/api/cvs/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'CV', id }],
    }),

    getCVExtractedData: builder.query<{ success: boolean; data: CVExtractedData }, string>({
      query: (id) => ({
        url: `/api/cvs/${id}/extracted-data`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'CVExtractedData', id }],
    }),

    updateCV: builder.mutation<{ success: boolean; data: CV }, { id: string; data: Partial<CV> }>({
      query: ({ id, data }) => ({
        url: `/api/cvs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CV', id },
        'CVs'
      ],
    }),

    deleteCV: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/cvs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['CVs'],
    }),

    reprocessCV: builder.mutation<{ success: boolean; message: string; data: CV }, string>({
      query: (id) => ({
        url: `/api/cvs/${id}/reprocess`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CV', id },
        { type: 'CVExtractedData', id },
        'CVs'
      ],
    }),

    downloadCV: builder.query<Blob, string>({
      query: (id) => ({
        url: `/api/cvs/${id}/download`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportCV: builder.query<Blob, { id: string; format: 'json' | 'pdf' }>({
      query: ({ id, format }) => ({
        url: `/api/cvs/${id}/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useUploadCVMutation,
  useListCVsQuery,
  useGetCVByIdQuery,
  useGetCVExtractedDataQuery,
  useUpdateCVMutation,
  useDeleteCVMutation,
  useReprocessCVMutation,
  useLazyDownloadCVQuery,
  useLazyExportCVQuery,
} = cvApi;

export default cvApi;
