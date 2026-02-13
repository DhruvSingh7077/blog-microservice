// "use client";

// import { useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import Loading from "@/components/loading";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useGoogleLogin } from "@react-oauth/google";
// import { useAppData, user_service } from "@/context/AppContext";
// import axios from "axios";

// import Cookies from "js-cookie";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

// interface LoginResponse {
//   token: string;
//   message: string;
// }

// const LoginPage = () => {
//   const { isAuth, user, setIsAuth, loading, setLoading, setUser } =
//     useAppData();
//   const router = useRouter();

//   useEffect(() => {
//     if (isAuth) {
//       router.push("/blogs");
//     }
//   }, [isAuth, router]);

//   const responseGoogle = async (authResult: any) => {
//     setLoading(true);
//     try {
//       // ✅ Changed to use proxy route
//       const result = await axios.post<LoginResponse>(
//         `/api/auth/login`,
//         {
//           code: authResult["code"],
//         }
//       );
//       Cookies.set("token", result.data.token, {
//         expires: 7,
//         secure: true,
//         path: "/",
//       });
//       toast.success(result.data.message);
//       setIsAuth(true);
//       setLoading(false);
//       setUser(user);
//       router.push("/blogs");
//     } catch (error) {
//       console.error("Login failed", error);
//       toast.error("Problem while login you");
//       setLoading(false);
//     }
//   };

//   const googleLogin = useGoogleLogin({
//     onSuccess: responseGoogle,
//     onError: responseGoogle,
//     flow: "auth-code",
//   });
//   // ✅ new demo-login
//   const handleDemoLogin = async () => {
//     try {
//       setLoading(true);
//    // ✅ Changed to use proxy route
//       const { data } = await axios.post<LoginResponse & { user: any }>(
//         `/api/auth/demo`
//       );


//       Cookies.set("token", data.token, {
//         expires: 7,
//         secure: true,
//         path: "/",
//       });

//       toast.success(data.message || "Logged in as demo user");
//       setIsAuth(true);
//       setUser(data.user);
//       router.push("/blogs");
//     } catch (error) {
//       console.error("Demo login failed", error);
//       toast.error("Failed to login as demo user");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {loading ? (
//         <Loading />
//       ) : (
//         <div className="w-[350px] m-auto mt-[200px]">
//           <Card className="w-[350px]">
//             <CardHeader>
//               <CardTitle>Login to the Reading Retreat</CardTitle>
//               <CardDescription>Your go to blog app</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-3">
//               <Button onClick={googleLogin}>Login with google</Button>
//               {/* ✅ Demo user button */}
//               <Button
//                 variant="outline"
//                 onClick={handleDemoLogin}
//                 className="w-full"
//               >
//                 Continue as demo user
//               </Button>
//             </CardContent>
//             <CardFooter className="flex-col gap-2"></CardFooter>
//           </Card>
//         </div>
//       )}
//     </>
//   );
// };

// export default LoginPage;
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useAppData, User, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { redirect } from "next/navigation";
import Loading from "@/components/loading";
interface LoginResponse {
  token: string;
  message: string;
  user: User;
}


const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();

  if (isAuth) return redirect("/blogs");

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post<LoginResponse>(`${user_service}/api/v1/login`, {
        code: authResult["code"],
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        path: "/",
      });
      toast.success(result.data.message);
      setIsAuth(true);
      setLoading(false);
      setUser(result.data.user);
    } catch (error) {
      console.log("error", error);
      toast.error("Problem while login you");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[350px] m-auto mt-[200px]">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Login to The Reading Retreat</CardTitle>
              <CardDescription>Your go to blog app</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={googleLogin}>
                Login with google{" "}
                <img
                  src={"/google.png"}
                  className="w-6 h-6"
                  alt="google icon"
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;