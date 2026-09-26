import { Suspense } from "react";
import { Metadata } from "next";
import { SearchPageView } from "@/components/search/SearchPageView";
import { getBaseUrl } from "@/lib/utils";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const title = "Search Archive | ThePathak.tech";
  const description =
    "Search all technical publications, essays, scientific explainers, poetry, and author profiles across ThePathak.tech.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/search`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/search`,
      siteName: "ThePathak.tech",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageView />
    </Suspense>
  );
}
