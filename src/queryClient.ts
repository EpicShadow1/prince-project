/**
 * TanStack Query Client Configuration
 * Optimized for performance with aggressive caching
 */

import { QueryClient } from '@tanstack/react-query';

// Query key factory for type-safe cache management
export const queryKeys = {
  cases: {
    all: ['cases'] as const,
    lists: (filters: Record<string, unknown>) => ['cases', 'list', filters] as const,
    detail: (id: string) => ['cases', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  documents: {
    all: ['documents'] as const,
    byCase: (caseId: string) => ['documents', 'case', caseId] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    byDate: (date: string) => ['calendar', date] as const,
  },
  chat: {
    all: ['chat'] as const,
    messages: (userId: string) => ['chat', 'messages', userId] as const,
  },
};

// Optimized QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache persists for 10 minutes after last use
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (we have WebSocket for real-time)
      refetchOnReconnect: false,
      // Placeholder data for better UX
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Prefetch strategies for common navigation patterns
export const prefetchStrategies = {
  // Prefetch case details when hovering over case links
  prefetchCase: (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.cases.detail(caseId),
      staleTime: 5 * 60 * 1000,
    });
  },

  // Prefetch next page of cases for infinite scroll
  prefetchNextCasesPage: (page: number, filters: Record<string, unknown>) => {
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.cases.lists(filters), page],
      staleTime: 5 * 60 * 1000,
    });
  },

  // Prefetch user profile
  prefetchUser: (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      staleTime: 10 * 60 * 1000,
    });
  },
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Update case in cache optimistically
  updateCase: (caseId: string, updates: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.cases.detail(caseId),
      (old: Record<string, unknown> | undefined) => 
        old ? { ...old, ...updates } : undefined
    );
  },

  // Add case to list optimistically
  addCase: (newCase: Record<string, unknown>) => {
    queryClient.setQueryData(
      queryKeys.cases.all,
      (old: Array<Record<string, unknown>> | undefined) => 
        old ? [newCase, ...old] : [newCase]
    );
  },

  // Remove case from cache
  removeCase: (caseId: string) => {
    queryClient.removeQueries({ queryKey: queryKeys.cases.detail(caseId) });
    queryClient.setQueryData(
      queryKeys.cases.all,
      (old: Array<{ id: string }> | undefined) => 
        old ? old.filter((c) => c.id !== caseId) : undefined
    );
  },
};

// Cache invalidation helpers
export const invalidateCache = {
  cases: () => queryClient.invalidateQueries({ queryKey: queryKeys.cases.all }),
  case: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(id) }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  documents: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all }),
  calendar: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all }),
  all: () => queryClient.invalidateQueries(),
};
