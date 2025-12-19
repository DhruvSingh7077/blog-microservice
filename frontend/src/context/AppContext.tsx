"use client";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
export const user_service = "http://localhost:5000";
export const author_service = "http://localhost:5001";
export const blog_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  bio: string;
}
export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  blogs: Blog[] | null;
  blogLoading: boolean;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  fetchBlogs: () => Promise<void>;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      const response = await axios.get<User>(`${user_service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const [blogLoading, setBlogLoading] = useState(true);

  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  async function fetchBlogs() {
    setBlogLoading(true);
    try {
      const { data } = await axios.get<Blog[]>(
        `${blog_service}/api/v1/blog/all?searchQuery=${searchQuery}&category=${category}`
      );

      setBlogs(data);
    } catch (error) {
      console.log(error);
    } finally {
      setBlogLoading(false);
    }
  }
  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);

    toast.success("Logged out successfully");
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery, category]);
  return (
    <AppContext.Provider
      value={{
        user,
        setIsAuth,
        isAuth,
        loading,
        setLoading,
        setUser,
        logoutUser,
        blogs,
        blogLoading,
        setCategory,
        setSearchQuery,
        searchQuery,
        fetchBlogs,
      }}
    >
      <GoogleOAuthProvider clientId="806110013502-427pun0c8fteinlot8v2tjgi95php1qi.apps.googleusercontent.com">
        {children} <Toaster />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
