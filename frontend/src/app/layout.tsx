import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar";
import { AppProvider } from "@/context/AppContext";
export const metadata: Metadata = {
  title: "The Reading Retreat",
  description: "Discover , save and manage your Favourite Blogs easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#050509] text-foreground antialiased">
        <AppProvider>
          <Navbar />

          <main className="container mx-auto px-3 pb-10 pt-6 md:px-6 bg-gradient-to-b from-transparent via-[#0b0b12] to-[#050509]">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
