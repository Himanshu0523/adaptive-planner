import { QueryClient} from '@tanstack/react-query';

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 100 * 60 * 5, // 5 minutes
                retry: 1, // Retry failed requests once
                refetchOnWindowFocus: false, // Disable refetching on window focus
            },
        },
    });
}