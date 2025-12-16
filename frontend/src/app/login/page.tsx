"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGoogleLogin } from "@react-oauth/google";
import { user_service } from "@/context/AppContext";
import axios from "axios";

import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface LoginResponse {
  token: string;
  message: string;
}

const LoginPage = () => {
  const responseGoogle = async (authResult: any) => {
    console.log("Google authResult:", authResult);
    try {
      const result = await axios.post<LoginResponse>(
        `${user_service}/api/v1/login`,
        {
          code: authResult["code"],
        }
      );
      console.log("Login API result:", result.data);
      Cookies.set("token", result.data.token, {
        expires: 7,
        secure: true,
        path: "/",
      });
      toast.success(result.data.message);
    } catch (error) {
      console.error("Login failed", error);
      const anyError = error as any;
      console.error(
        "Axios error response:",
        anyError?.response?.status,
        anyError?.response?.data
      );

      toast.error("Problem while login you");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <div className="w-[350px] m-auto mt-[200px]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login to the Reading Retreat</CardTitle>
          <CardDescription>Your go to blog app</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={googleLogin}>Login with google</Button>
        </CardContent>
        <CardFooter className="flex-col gap-2"></CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
