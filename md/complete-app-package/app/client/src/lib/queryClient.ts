import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function refreshToken(): Promise<string | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('startender_user', JSON.stringify(data.user));
      console.log('Token refreshed successfully');
      return data.token;
    } else {
      console.log('Token refresh failed, clearing localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('startender_user');
      return null;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export async function apiRequest(
  url: string,
  options: {
    method: string;
    body?: string;
    headers?: Record<string, string>;
  } = { method: "GET" }
): Promise<Response> {
  // Get current user and token from localStorage with retries to handle timing issues
  let storedUser = localStorage.getItem('startender_user');
  let token = localStorage.getItem('token');
  
  // If no user or token found, try alternative keys and wait briefly
  if (!storedUser || !token) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Brief wait
    storedUser = localStorage.getItem('startender_user') || localStorage.getItem('user');
    token = localStorage.getItem('token');
  }
  
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const headers: Record<string, string> = {
    ...options.headers
  };
  
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add both JWT token and x-user-id header for backward compatibility
  console.log("ApiRequest Debug - Token exists:", !!token);
  console.log("ApiRequest Debug - CurrentUser:", currentUser);
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("ApiRequest Debug - Added Authorization header");
  } else {
    console.log("ApiRequest Debug - No token found in localStorage");
  }
  
  if (currentUser?.id) {
    headers["x-user-id"] = currentUser.id.toString();
    console.log("ApiRequest Debug - Setting x-user-id header to:", currentUser.id);
  } else {
    console.log("ApiRequest Debug - No currentUser found in localStorage:", currentUser);
  }
  
  console.log("ApiRequest Debug - Final headers:", Object.keys(headers));
  
  let res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body,
    credentials: "include",
  });

  // If we get a 401 error, try refreshing the token
  if (res.status === 401 && token) {
    console.log('Received 401 error, attempting token refresh...');
    const newToken = await refreshToken();
    
    if (newToken) {
      // Retry the request with the new token
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, {
        method: options.method,
        headers,
        body: options.body,
        credentials: "include",
      });
    } else {
      // Token refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get current user and token from localStorage
    const storedUser = localStorage.getItem('startender_user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {};
    
    // Add both JWT token and x-user-id header for backward compatibility
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (currentUser?.id) {
      headers["x-user-id"] = currentUser.id.toString();
      console.log("Setting x-user-id header to:", currentUser.id, "for query");
    } else {
      console.log("No currentUser found in localStorage for query:", currentUser);
    }
    
    let res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    // If we get a 401 error, try refreshing the token
    if (res.status === 401 && token) {
      console.log('Query received 401 error, attempting token refresh...');
      const newToken = await refreshToken();
      
      if (newToken) {
        // Retry the request with the new token
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(queryKey[0] as string, {
          headers,
          credentials: "include",
        });
      }
    }

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      } else if (unauthorizedBehavior === "redirect") {
        window.location.href = "/login";
        return null;
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
