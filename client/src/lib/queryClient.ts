import { QueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Define o fetcher padrão para usar nossa função apiRequest
queryClient.setQueryDefaults(['api'], {
  queryFn: ({ queryKey }: any) => {
    const [, endpoint] = queryKey;
    return apiRequest(endpoint);
  },
});

export { apiRequest };