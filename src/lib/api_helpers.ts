// src/lib/api_helpers.ts
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get('access_token');
    
    // Use the Headers class for easier and type-safe manipulation
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    let body = options.body;

    // Handle body type and Content-Type header automatically
    if (body instanceof FormData) {
        // When body is FormData, we let the browser set the Content-Type header
        // with the correct boundary. We must not set it manually.
        headers.delete('Content-Type');
    } else if (body && typeof body !== 'string') {
        // If the body is a plain object, stringify it and set the correct header.
        body = JSON.stringify(body);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
        body,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText };
            }
            const message = errorData.detail || `An error occurred: ${response.statusText}`;
            throw new Error(message);
        }
        
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// The helper functions are now simpler as the request function handles the logic.
export const get = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'GET' });
export const post = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: 'POST', body });
export const put = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: 'PUT', body });
export const del_ = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'DELETE' });
