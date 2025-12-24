import axios from "axios";

 
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


export const usersData = async () => {
  try {
    const response = await API.get("/user/admin/users");
    return response.data || response.json();
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Failed to Fetch Users",
      }
    );
  }
};

export const usersUpdateData = async (id , body) => {
  try {
    const response = await API.patch(`/user/admin/users/${id}`,body);
    return response.data || response.json();
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Failed to Update User",
      }
    );
  }
};

export const userDeleteData = async (id) => {
  try {
    const response = await API.delete(`/user/admin/users/${id}`);
    return response.data || response.json();
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: "Failed to Delete User",
      }
    );
  }
};
