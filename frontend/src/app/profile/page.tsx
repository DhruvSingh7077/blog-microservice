"use client";
import React, { useState } from "react";
import { useAppData, user_service } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useRef } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import type { User } from "@/context/AppContext";

interface UpdatePicResponse {
  message: string;
  token: string;
  user: User;
}

import toast from "react-hot-toast";

const ProfilePage = () => {
  const InputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const clickHandler = () => {
    InputRef.current?.click();
  };

  const changeHandler = async (e: any) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.post<UpdatePicResponse>(
          `${user_service}/api/v1/user/update/pic`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(data.message);
        setLoading(false);
        Cookies.set("token", data.token, {
          expires: 7,
          secure: true,
          path: "/",
        });
        setUser(data.user);
      } catch (error) {
        toast.error("Error uploading file");
        setLoading(false);
      }
    }
  };
  const { user, setUser } = useAppData();
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Profile</CardTitle>

          <CardContent className="flex flex-col items-center space-4">
            <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer">
              <AvatarImage src={user?.image} alt="profile pic" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={InputRef}
                onChange={changeHandler}
              />
            </Avatar>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ProfilePage;
