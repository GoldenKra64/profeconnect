import { apiClient } from './client';
import type {
  ApiResponse,
  Publication,
  CreatePublicationPayload,
} from '../types';

export async function getPublications(): Promise<Publication[]> {
  const response = await apiClient.get<ApiResponse<Publication[]>>('/publications');
  return response.data.data;
}

export async function createPublication(
  payload: CreatePublicationPayload
): Promise<Publication> {
  const response = await apiClient.post<ApiResponse<Publication>>(
    '/publications',
    payload
  );
  return response.data.data;
}
