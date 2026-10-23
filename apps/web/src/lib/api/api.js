const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest(endpoint, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('API base URL is not defined. Please set NEXT_PUBLIC_API_URL in your environment variables.');
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
    }

    if (response.status === 204) {
        return null;
    }
    return response.json();
}