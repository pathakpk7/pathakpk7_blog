"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium">
      {SECTIONS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              "relative px-3 py-1.5 text-xs xl:text-[13px] transition-colors rounded-sm",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="relative z-10">{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 bg-secondary/80 rounded-sm -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
