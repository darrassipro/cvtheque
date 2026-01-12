import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import {
  LLMConfig,
  CreateLLMConfigData,
  UpdateLLMConfigData,
  TestLLMConfigData,
  TestLLMConfigResponse,
} from "@/types/llm.types";

export const llmConfigApi = createApi({
  reducerPath: "llmConfigApi",
  baseQuery: baseQuery,
  tagTypes: ['LLMConfig', 'LLMConfigs'],
  endpoints: (builder) => ({
    listLLMConfigs: builder.query<{ success: boolean; data: LLMConfig[] }, void>({
      query: () => ({
        url: "/api/llm-config",
        method: "GET",
      }),
      providesTags: ['LLMConfigs'],
    }),

    getLLMConfigById: builder.query<{ success: boolean; data: LLMConfig }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'LLMConfig', id }],
    }),

    createLLMConfig: builder.mutation<{ success: boolean; data: LLMConfig }, CreateLLMConfigData>({
      query: (data) => ({
        url: "/api/llm-config",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    updateLLMConfig: builder.mutation<{ success: boolean; data: LLMConfig }, { id: string; data: UpdateLLMConfigData }>({
      query: ({ id, data }) => ({
        url: `/api/llm-config/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'LLMConfig', id },
        'LLMConfigs'
      ],
    }),

    deleteLLMConfig: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['LLMConfigs'],
    }),

    testLLMConfig: builder.mutation<TestLLMConfigResponse, TestLLMConfigData>({
      query: (data) => ({
        url: "/api/llm-config/test",
        method: "POST",
        body: data,
      }),
    }),

    setActiveLLMConfig: builder.mutation<{ success: boolean; data: LLMConfig }, string>({
      query: (id) => ({
        url: `/api/llm-config/${id}/activate`,
        method: "PUT",
      }),
      invalidatesTags: ['LLMConfigs'],
    }),
  }),
});

export const {
  useListLLMConfigsQuery,
  useGetLLMConfigByIdQuery,
  useCreateLLMConfigMutation,
  useUpdateLLMConfigMutation,
  useDeleteLLMConfigMutation,
  useTestLLMConfigMutation,
  useSetActiveLLMConfigMutation,
} = llmConfigApi;

export default llmConfigApi;
