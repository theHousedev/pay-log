import { getBackendPath } from './backend';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
    const backendBase = getBackendPath();
    const url = `${backendBase}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });
}