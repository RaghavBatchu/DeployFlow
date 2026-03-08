// When running in production (Docker Nginx), we use relative paths so Nginx can proxy `/api` back to the backend.
// In local dev, it falls back to `http://localhost:5000/api` unless specified otherwise.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export interface User {
  id: number;
  name: string;
  email: string;
  role: "developer" | "qa" | "devops" | "manager";
  /** All roles for this user (when fetched from /users); use for multi-role display */
  roles?: string[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const api = {
  async register(
    name: string,
    email: string,
    password: string,
    roles: string[]
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, roles }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  async login(
    email: string,
    password: string,
    roleOverride?: string
  ): Promise<AuthResponse> {
    const body: any = { email, password };
    if (roleOverride) {
      body.role_override = roleOverride;
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  async getUsers(): Promise<User[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },

  async getLogs(): Promise<any[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    return response.json();
  },

  async getPipeline(pipelineId?: number): Promise<any> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = pipelineId
      ? `${API_BASE_URL}/pipeline?pipelineId=${pipelineId}`
      : `${API_BASE_URL}/pipeline`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pipeline");
    }

    return response.json();
  },

  async getPipelines(): Promise<any[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/pipeline/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pipelines");
    }

    return response.json();
  },

  async createPipeline(data: {
    projectName: string;
    qaId: number;
    devopsId: number;
    managerId: number;
    developerId: number;
    coDeveloperId?: number;
  }): Promise<any> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to create pipeline");
    }

    return response.json();
  },

  async pipelineAction(
    pipelineId: number,
    action: string,
    decision: "approve" | "reject" = "approve",
    comment: string = ""
  ): Promise<{ pipeline: any; toastMessage?: string }> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/pipeline/action`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pipelineId, action, decision, comment }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Action failed");
    }

    return response.json();
  },

  async getLogsForPipeline(pipelineId?: number): Promise<any[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = pipelineId
      ? `${API_BASE_URL}/logs?pipelineId=${pipelineId}`
      : `${API_BASE_URL}/logs`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    return response.json();
  },
};

export const auth = {
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? (JSON.parse(userStr) as User) : null;
  },

  setAuth(token: string, user: User): void {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

