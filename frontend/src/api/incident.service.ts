import { apiClient } from './client';
import type { ApiResponse, SecurityIncident } from '../types';

export async function getPendingIncidents(): Promise<SecurityIncident[]> {
  const response = await apiClient.get<ApiResponse<SecurityIncident[]>>('/admin/incidents');
  return response.data.data;
}

export async function resolveIncident(id: number): Promise<SecurityIncident> {
  const response = await apiClient.patch<ApiResponse<SecurityIncident>>(`/admin/incidents/${id}/resolve`);
  return response.data.data;
}
