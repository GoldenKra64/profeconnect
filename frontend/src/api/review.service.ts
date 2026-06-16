import { apiClient } from './client';
import type { ApiResponse, PlatformReviewListResponse } from '../types';

export interface CreatePlatformReviewPayload {
  rating: number;
  comment?: string;
}

export async function createPlatformReview(
  payload: CreatePlatformReviewPayload
): Promise<void> {
  await apiClient.post<ApiResponse<unknown>>('/reviews', payload);
}

export async function getPlatformReviews(): Promise<PlatformReviewListResponse> {
  const response = await apiClient.get<ApiResponse<PlatformReviewListResponse>>(
    '/admin/reviews'
  );
  return response.data.data;
}
