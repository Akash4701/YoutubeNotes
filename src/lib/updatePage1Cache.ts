import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";




/**
 * Invalidate (and optionally rebuild) Redis cache for page 1 notes
 */
export async function updatePage1Cache({
  rebuild = false,
  limit = 10,
}: {
  rebuild?: boolean;
  limit?: number;
}) {
  const cacheKey = `notes:page:1`;

  // 🧹 1. Invalidate old cache
  await redis.del(cacheKey);
  console.log("🧹 Cache invalidated for page 1");

  // ♻️ 2. Optionally rebuild cache
  if (rebuild) {
   

    await redis.set(cacheKey, JSON.stringify(freshNotes), { ex: 300 }); // 5 min cache
    console.log("⚡ Cache rebuilt for page 1");
  }
}
