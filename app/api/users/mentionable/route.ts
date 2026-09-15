import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    const users = await db.user.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { profile: { username: { contains: query, mode: "insensitive" } } },
              { profile: { displayName: { contains: query, mode: "insensitive" } } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        image: true,
        profile: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      take: 10,
    });

    const formatted = users.map((u) => {
      const username = u.profile?.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, "_") : "reader");
      const displayName = u.profile?.displayName || u.name || "Reader";
      const avatar = u.profile?.avatarUrl || u.image;
      return {
        id: u.id,
        username,
        displayName,
        avatar,
      };
    });

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error("Error fetching mentionable users:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
