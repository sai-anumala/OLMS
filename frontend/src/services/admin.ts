import { apiRequest } from "./api";
import type { UserType } from "../types/UserType";

export const getDashboard = () => apiRequest("/admin-api/dashboard");
export const getAllUsers = () => apiRequest("/user-api/users");
export const updateMember = ({ _id, username, email, mobile }: UserType) =>
  apiRequest("/admin-api/update-user", "PUT", { _id, username, email, mobile });
export const toggleMemberHold = (userId: string) => apiRequest("/admin-api/hold-user", "PUT", { userId });
export const deleteMember = (userId: string) => apiRequest("/admin-api/delete-user", "PUT", { userId });
