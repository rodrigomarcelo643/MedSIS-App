import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

interface User {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  program?: string;
  gender?: string;
  nationality?: string;
  foreigner_specify?: string;
  year_level_id?: string;
  year_level_name?: string;
  account_status?: string;
  enrollment_status: string;
  evaluation_status: string;
  academic_year: string;
  avatar?: string;
  avatar_url?: string;
  avatar_data?: string; 
  contact_number?: string;
  joinDate?: string;
  policy_accepted?: number;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  clearUser: () => void;
  updateUserPolicyStatus: (accepted: boolean) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  clearUser: () => {},
  updateUserPolicyStatus: async () => {},
  updateUser: async () => {},
  refreshUser: async () => {},
  changePassword: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("User loaded from storage:", parsedUser.id);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: User) => {
    // Prevent login if account is deactivated
    if (userData.account_status === "Deactivated" || userData.account_status === "deactivated") {
      console.warn("Login failed: Account is deactivated.");
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Your account has been deactivated",
        position: "top",
      });
      return;
    }

    // default values for optional fields with proper avatar handling
    const userWithDefaults = {
      ...userData,
      avatar: userData.avatar || userData.avatar_url || "https://msis.eduisync.io/swu-head.png",
      avatar_url: userData.avatar_url || userData.avatar || null, 
      avatar_data: userData.avatar_data || null,
      contact_number: userData.contact_number || "Not provided",
      joinDate: userData.joinDate || "Member since 2023",
      policy_accepted: userData.policy_accepted || 0,
      year_level_name: userData.year_level_name || (userData.year_level_id === 4 ? "Graduating" : `Year ${userData.year_level_id}`),
    };

    console.log("Storing user in context:", { 
      id: userWithDefaults.id,
      student_id: userWithDefaults.student_id,
      has_avatar_data: !!userWithDefaults.avatar_data,
      has_avatar_url: !!userWithDefaults.avatar_url
    });
    
    setUser(userWithDefaults);
    await AsyncStorage.setItem("user", JSON.stringify(userWithDefaults));
    
    console.log("User stored successfully in AsyncStorage");
  };

  const logout = async () => {
    console.log("Logging out user");
    setUser(null);
    await AsyncStorage.removeItem("user");
    console.log("User removed from storage");
  };

  // Clear user without removing from storage (for edge cases)
  const clearUser = () => {
    console.log("Clearing user from context (soft logout)");
    setUser(null);
  };

  // Update user's policy acceptance status
  const updateUserPolicyStatus = async (accepted: boolean) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      policy_accepted: accepted ? 1 : 0,
    };
    
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("Policy status updated:", accepted);
  };

  // Update any user properties
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...updates,
    };
    
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("User updated with:", Object.keys(updates));
  };

  // Refresh user data from API (useful for getting latest avatar_data)
  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://msis.eduisync.io/api";
      const response = await fetch(`${API_URL}/get_user_data.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        await login(data.user); // Update with latest data including avatar_data
        console.log("User data refreshed from API");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  };

  // Change user password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://msis.eduisync.io/api";
      const response = await fetch(`${API_URL}/change_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated successfully',
          position: 'top',
        });
        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to change password',
          position: 'top',
        });
        return false;
      }
    } catch (error) {
      console.error("Error changing password:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
        position: 'top',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      clearUser,
      updateUserPolicyStatus,
      updateUser,
      refreshUser,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};