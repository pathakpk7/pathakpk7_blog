"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { name: "Home", href: "/" },
  { name: "Technology", href: "/technology" },
  { name: "Science", href: "/science" },
  { name: "Coding", href: "/coding" },
  { name: "Ideas", href: "/ideas" },
  { name: "Creative", href: "/creative" },
  { name: "Notes", href: "/notes" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
      {SECTIONS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 whitespace-nowrap text-[13px] py-1",
              isActive
                ? "text-zinc-900 dark:text-zinc-100 font-semibold border-b-2 border-blue-600 dark:border-blue-500 pb-0.5"
                : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

