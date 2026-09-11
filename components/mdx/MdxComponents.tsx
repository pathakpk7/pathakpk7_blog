import React from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle, Info, AlertTriangle, Quote as QuoteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  children: React.ReactNode;
  type?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Callout({ children, type = "info", title }: CalloutProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
  };

  const bgStyles = {
    info: "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-950 dark:text-blue-200",
    success: "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200",
    warning: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200",
    error: "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-950 dark:text-rose-200",
  };

  return (
    <div className={cn("flex items-start space-x-3 my-6 p-4 rounded-xl border text-sm leading-relaxed", bgStyles[type])}>
      {icons[type]}
      <div className="space-y-1">
        {title && <p className="font-semibold text-base tracking-tight">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function CustomQuote({ children, author, citation }: { children: React.ReactNode; author?: string; citation?: string }) {
  return (
    <figure className="my-8 pl-6 border-l-4 border-blue-600 dark:border-blue-500 space-y-2">
      <blockquote className="font-serif-editorial italic text-xl text-foreground leading-relaxed">
        {children}
      </blockquote>
      {(author || citation) && (
        <figcaption className="text-xs text-muted-foreground font-sans not-italic font-medium">
          — {author} {citation && <span className="text-zinc-400 dark:text-zinc-500">({citation})</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function CustomFigure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-8 space-y-2">
      <div className="relative h-96 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground italic font-serif">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function CustomTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-foreground uppercase tracking-wider text-xs font-semibold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 border-b border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/50 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 font-normal">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const mdxComponents = {
  Callout,
  Quote: CustomQuote,
  Figure: CustomFigure,
  Table: CustomTable,
};
