import { getCachedHomePageData } from "@/lib/db/cached-queries";
import { HomePageClient } from "@/components/home/HomePageClient";

export const revalidate = 120;

export default async function HomePage() {
  const {
    featuredPosts,
    techPosts,
    sciencePosts,
    codingPosts,
    creativePosts,
    notesPosts,
  } = await getCachedHomePageData();

  return (
    <HomePageClient
      featuredPosts={featuredPosts}
      techPosts={techPosts}
      sciencePosts={sciencePosts}
      codingPosts={codingPosts}
      creativePosts={creativePosts}
      notesPosts={notesPosts}
    />
  );
}
