"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Rent or Buy
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="group/trigger inline-flex items-center justify-center rounded-full outline-none select-none"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="transition-colors group-hover/trigger:bg-[#F1C878]">
                    {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {session.user.email}
                </div>
                <DropdownMenuItem
                  render={<Link href="/dashboard" />}
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/palette" />}
                >
                  Palettes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
