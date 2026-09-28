import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MailTemplatePreviewRequest, MailTemplateRequest } from '../../types/api';
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  getTemplates,
  previewTemplate,
  updateTemplate,
  type TemplateFilters,
} from '../api/templatesApi';

export function useTemplates(filters: TemplateFilters) {
  return useQuery({
    queryKey: ['mail-templates', filters.search ?? '', Boolean(filters.activeOnly)],
    queryFn: () => getTemplates(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTemplate(id: number | null) {
  return useQuery({
    queryKey: ['mail-template', id],
    queryFn: () => getTemplate(id as number),
    enabled: id != null,
  });
}

export function useSaveTemplate(id: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: MailTemplateRequest) => (id == null ? createTemplate(request) : updateTemplate(id, request)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['mail-templates'] });
      queryClient.setQueryData(['mail-template', saved.id], saved);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mail-templates'] }),
  });
}

export function usePreviewTemplate(id: number | null) {
  return useMutation({
    mutationFn: (request: MailTemplatePreviewRequest) => previewTemplate(id as number, request),
  });
}
