"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CircleUserRoundIcon, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, isAuth } = useAppData();
  const pathname = usePathname();

  const isBlogs = pathname === "/blogs";
  const isSaved = pathname === "/blog/saved";

  return (
    <nav className="sticky top-0 z-50 border-b border-red-900/40 bg-gradient-to-b from-black/95 via-[#050509]/96 to-[#050509]/90 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 md:px-6">
        {/* Brand */}
        <Link
          href="/blogs"
          className="text-lg font-semibold tracking-tight text-slate-50 hover:text-red-400 transition-colors"
        >
          The Reading Retreat
        </Link>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            className="text-slate-200 hover:text-red-400"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <li>
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/blogs"
                className={cn(
                  "hover:text-red-400 transition-colors",
                  isBlogs && "text-red-400"
                )}
              >
                Home
              </Link>
              <span
                className={cn(
                  "h-0.5 w-0 rounded-full bg-red-400 transition-all duration-200",
                  isBlogs && "w-6"
                )}
              />
            </div>
          </li>
          <li>
            <div className="flex flex-col items-center gap-1">
              <Link
                href="/blog/saved"
                className={cn(
                  "hover:text-red-400 transition-colors",
                  isSaved && "text-red-400"
                )}
              >
                Saved Blogs
              </Link>
              <span
                className={cn(
                  "h-0.5 w-0 rounded-full bg-red-400 transition-all duration-200",
                  isSaved && "w-8"
                )}
              />
            </div>
          </li>
          <li>
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-700" />
            ) : isAuth ? (
              <Link
                href="/profile"
                aria-label="Profile"
                className="hover:text-red-400 transition-colors"
              >
                <CircleUserRoundIcon className="h-6 w-6" />
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="hover:text-red-400 transition-colors"
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-red-900/40 bg-[#050509]/98 shadow-lg transition-all duration-200 ease-in-out",
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col items-center gap-4 px-4 py-3 text-sm font-medium text-slate-300">
          <li>
            <Link
              href="/blogs"
              className={cn(
                "hover:text-red-400 transition-colors",
                isBlogs && "text-red-400"
              )}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/blog/saved"
              className={cn(
                "hover:text-red-400 transition-colors",
                isSaved && "text-red-400"
              )}
              onClick={() => setIsOpen(false)}
            >
              Saved Blogs
            </Link>
          </li>
          <li>
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-700" />
            ) : isAuth ? (
              <Link
                href="/profile"
                aria-label="Profile"
                className="hover:text-red-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <CircleUserRoundIcon className="h-6 w-6" />
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="hover:text-red-400 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
