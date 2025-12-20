"use client";

import React, { useEffect, useState } from "react";
import { useAppData, user_service, User } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import Loading from "@/components/loading";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";

const UserProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>();

  async function fetchUser() {
    try {
      setLoading(true);
      const { data } = await axios.get<User>(
        `${user_service}/api/v1/user/${id}`
      );
      setUser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer">
            <AvatarImage src={user.image} alt="profile pic" />
          </Avatar>

          <div className="w-full space-y-2 text-center">
            <label className="font-medium">Name</label>
            <p>{user.name}</p>
          </div>

          {user.bio && (
            <div className="w-full space-y-2 text-center">
              <label className="font-medium">Bio</label>
              <p>{user.bio}</p>
            </div>
          )}

          <div className="flex gap-4 mt-3">
            {user.instagram && (
              <a
                href={user.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="text-pink-500 text-2xl" />
              </a>
            )}

            {user.facebook && (
              <a href={user.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="text-blue-500 text-2xl" />
              </a>
            )}

            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="text-blue-500 text-2xl" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
