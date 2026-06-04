import { apiClient } from './client';
import type { ApiResponse } from '../types';

export type SuggestedTag = { id: number; name: string | null };

export type ClassifyResult = {
  suggestedTags: SuggestedTag[];
  pedagogicalScore: number | null;
  rationale: string | null;
  applied: boolean;
  post?: unknown;
};

export async function classifyPublication(payload: {
  title: string;
  content: string;
  postId?: number;
  applyTags?: boolean;
}): Promise<ClassifyResult> {
  const response = await apiClient.post<ApiResponse<ClassifyResult>>('/ai/classify', payload);
  return response.data.data;
}
