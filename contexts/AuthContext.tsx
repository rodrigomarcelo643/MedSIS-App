import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  program?: string;
  nationality?: string;
  year_level_id?: string;
  account_status?: string;
  enrollment_status: string;
  evaluation_status: string;
  academic_year: string;
  avatar?: string;
  contact_number?: string;
  joinDate?: string;
  policy_accepted?: number;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  clearUser: () => void;
  updateUserPolicyStatus: (accepted: boolean) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  clearUser: () => {},
  updateUserPolicyStatus: async () => {},
  updateUser: async () => {},
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
          setUser(JSON.parse(storedUser));
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
  if (userData.account_status === "Deactivated") {
    console.warn("Login failed: Account is deactivated.");
    Toast.show({
      type: "error",
      text1: "Login Failed",
      text2: "Your account has been deactivated",
      position: "top",
    });
    return;
  }

  // Add default values for optional fields
  const userWithDefaults = {
    ...userData,
    avatar: userData.avatar || "https://i.pravatar.cc/150",
    contact_number: userData.contact_number || "No phone added",
    joinDate: userData.joinDate || "Member since 2023",
    policy_accepted: userData.policy_accepted || 0,
  };

  console.log("Storing user in context:", userWithDefaults);
  
  setUser(userWithDefaults);
  await AsyncStorage.setItem("user", JSON.stringify(userWithDefaults));
  
  console.log("User stored successfully in AsyncStorage");
};

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  // Clear user without removing from storage (for edge cases)
  const clearUser = () => {
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
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      clearUser,
      updateUserPolicyStatus,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);