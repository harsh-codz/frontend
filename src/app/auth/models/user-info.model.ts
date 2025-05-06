export interface UserInfoResponse {
    id: number; // Or string, adjust based on backend
    username: string;
    email: string;
    roles: string[]; // e.g., ["ROLE_ADMIN", "ROLE_STAFF"]
    passwordResetRequired: boolean;
    // Add any other relevant fields from the backend response
  }