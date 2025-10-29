import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { updatePage1Cache } from "@/lib/updatePage1Cache";
import { gql } from "graphql-tag";

// Type definitions
interface Context {
  user?: {
    uid: string;
    user_id: string;
  };
}

interface GetNotesArgs {
  page: number;
  limit: number;
  sortBy: string;
  userId?: string;
  saved?: boolean;
  userliked?: boolean;
  saveCache?: boolean;
}

interface SearchNotesArgs {
  searchTerm: string;
  searchBy: string;
  page: number;
  limit: number;
}

interface CreateNotesArgs {
  title: string;
  youtube_url: string;
  pdf_url: string;
  contentCreater?: string;
  thumbnail?: string;
  channelName?: string;
}

interface LikeNotesArgs {
  noteId: string;
  liked: boolean;
}

interface SaveNoteArgs {
  noteId: string;
  saved: boolean;
}

export const noteTypeDefs = gql`
  type Notes {
    id: ID!
    title: String!
    youtube_url: String!
    pdf_url: String!
    userId: ID!
    viewsCount: Int
    likesCount: Int
    contentCreater: String
    thumbnail: String
    channelName: String
    likes: [likes]!
    user: user
    savedByMe: Boolean
    createdAt: String!
    updatedAt: String!
    likedByMe: Boolean!
  }

  type user {
    profilePic: String
  }

  type likes {
    id: ID!
    noteId: ID!
    userId: ID!
    liked: Boolean
  }

  type Note {
    title: String!
    pdf_url: String!
  }

  type NotesResponse {
    notes: [Notes!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  enum SortOrder {
    TREND_DESC
    LIKES_ASC
    CREATED_AT_DESC
    CREATED_AT_ASC
    UPDATED_AT_DESC
    UPDATED_AT_ASC
   
  }

  enum SearchField {
    TITLE
    CREATOR
    CHANNEL
    URL
  }

  extend type Query {
    getNoteById(id: ID!): Note!
    getNotes(
      page: Int = 1
      limit: Int = 9
      sortBy: SortOrder = CREATED_AT_DESC
      userId: ID
      saved: Boolean
      userliked: Boolean
      saveCache: Boolean
    ): NotesResponse 

    searchNotes(
      searchTerm: String!
      searchBy: SearchField = TITLE
      page: Int = 1
      limit: Int = 10
    ): NotesResponse!
  }

  extend type Mutation {
    likeNotes(noteId: ID!, liked: Boolean): Boolean!
    saveNote(noteId: ID!, saved: Boolean): Boolean!
    createNotes(
      title: String!
      youtube_url: String!
      pdf_url: String!
      contentCreater: String
      thumbnail: String
      channelName: String
    ): Boolean
    deleteNotes(noteId:ID!):Boolean
  }
`;


const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in seconds
  TTL: {
    TREND_DESC: 300,        // 5 minutes - changes frequently
    CREATED_AT_DESC: 300,   // 5 minutes - new notes added often
    CREATED_AT_ASC: 600,    // 10 minutes - oldest notes rarely change
  },
  
  // Only cache these specific sort orders
  CACHEABLE_SORTS: ['TREND_DESC', 'CREATED_AT_DESC', 'CREATED_AT_ASC'],
};

// Helper function to generate cache key
function getCacheKey(page: number, sortBy: string): string {
  return `note:page:${page}:sort:${sortBy}`;
}

// Helper function to check if sort order should be cached
function isCacheableSort(sortBy: string): boolean {
  return CACHE_CONFIG.CACHEABLE_SORTS.includes(sortBy);
}

// Helper function to get TTL for a sort order
function getCacheTTL(sortBy: string): number {
  return CACHE_CONFIG.TTL[sortBy as keyof typeof CACHE_CONFIG.TTL] || 300;
}

async function invalidateAllNoteCaches() {
  try {
    const keysToDelete = CACHE_CONFIG.CACHEABLE_SORTS.map(sort => 
      getCacheKey(1, sort)
    );
    
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache keys:`, keysToDelete);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

export const noteResolvers = {
  Query: {
    getNoteById: async (
      _: unknown,
      { id }: { id: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const note = await prisma.note.findUnique({
        where: { id },
        select: {
          title: true,
          pdf_url: true,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      return note;
    },

      getNotes: async (
      _: unknown,
      { page, limit, sortBy, userId, saved, userliked, saveCache }: GetNotesArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      console.log("Context user:", context.user);
      console.log("Query params:", { page, limit, sortBy, userId, saved, userliked, saveCache });

      // Generate cache key based on page AND sortBy
      const cacheKey = getCacheKey(page, sortBy);

      // Only cache page 1 of cacheable sorts without filters
      const shouldUseCache = 
        page === 1 && 
        !userId && 
        !saved && 
        !userliked && 
        !saveCache &&
        isCacheableSort(sortBy);

      // Try to get from cache
      if (shouldUseCache) {
        try {
          const cached = await redis.get(cacheKey);
          console.log('cacheKey:', cacheKey);
          console.log('cache data type:', typeof cached);

          if (cached) {
            console.log(`🚀 Served from Redis cache (${sortBy})`);
            
            // Handle both string and object returns from Redis
            let cachedData;
            if (typeof cached === 'string') {
              cachedData = JSON.parse(cached);
            } else if (typeof cached === 'object') {
              cachedData = cached;
            } else {
              console.error('Unexpected cache data type:', typeof cached);
              throw new Error('Invalid cache data format');
            }
            
            return cachedData;
          } else {
            console.log(` Cache miss for ${sortBy}, fetching from DB...`);
          }
        } catch (error) {
          console.error("Redis cache read error:", error);
          // Continue to fetch from database
        }
      }

      // Build where clause
      const whereClause: any = {};
      if (!saved && !userliked && userId) {
        whereClause.userId = userId;
      }

      if (saved) {
        whereClause.savedByMe = {
          some: { userId: userId },
        };
      }

      if (userliked) {
        whereClause.likes = {
          some: {
            userId: userId,
            liked: true,
          },
        };
      }

      // Validate pagination parameters
      const validLimit = Math.min(Math.max(limit, 1), 50);
      const validPage = Math.max(page, 1);
      const offset = (validPage - 1) * validLimit;

      // Get sort order
      const getOrderBy = (sortBy: string): any => {
        switch (sortBy) {
          case "TREND_DESC":
            return [
              { savedByMe: { _count: "desc" } },
              { likes: { _count: "desc" } },
              { views: { _count: "desc" } },
            ];
          case "CREATED_AT_DESC":
            return { createdAt: "desc" };
          case "CREATED_AT_ASC":
            return { createdAt: "asc" };
          case "UPDATED_AT_DESC":
            return { updatedAt: "desc" };
          case "UPDATED_AT_ASC":
            return { updatedAt: "asc" };
          default:
            return { createdAt: "desc" };
        }
      };

      try {
        // Get total count and calculate pages
        const totalCount = await prisma.note.count({ where: whereClause });
        const totalPages = Math.ceil(totalCount / validLimit);

        // Fetch notes with relations
        const notes = await prisma.note.findMany({
          where: whereClause,
          skip: offset,
          take: validLimit,
          orderBy: getOrderBy(sortBy),
          include: {
            likes: {
              where: {
                userId: context.user.uid,
                liked: true,
              },
            },
            savedByMe: {
              where: {
                userId: context.user.uid,
              },
            },
            user: {
              select: {
                profilePic: true,
              },
            },
          },
        });

        // Format notes
        const formattedNotes = notes.map((note) => ({
          ...note,
          savedByMe: note.savedByMe.length > 0,
          likedByMe: note.likes.length > 0,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        }));

        console.log("Formatted notes count:", formattedNotes.length);

        const response = {
          notes: formattedNotes,
          totalCount,
          totalPages,
          currentPage: validPage,
          hasNextPage: validPage < totalPages,
          hasPreviousPage: validPage > 1,
        };

        // Cache page 1 results for cacheable sorts
        if (shouldUseCache) {
          try {
            const ttl = getCacheTTL(sortBy);
         await redis.set(
  cacheKey,
  JSON.stringify(response),
  {
    ex: ttl  // or { ex: ttl } depending on your client
  }
);
            console.log(`💾 Page 1 cached in Redis (${sortBy}, TTL: ${ttl}s)`);
          } catch (error) {
            console.error("Redis cache write error:", error);
          }
        }

        // If saveCache is true, return null (used for cache rebuild)
        if (saveCache) {
          return null;
        }

        return response;
      } catch (error: any) {
        console.error("Error fetching notes:", error.message);
        throw new Error("Failed to fetch notes");
      }
    },


    searchNotes: async (
      _: unknown,
      { searchTerm, searchBy, page, limit }: SearchNotesArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      if (!searchTerm.trim()) {
        throw new Error("Search term cannot be empty");
      }

      const validLimit = Math.min(Math.max(limit, 1), 50);
      const validPage = Math.max(page, 1);
      const offset = (validPage - 1) * validLimit;

      // Build search condition
      const getSearchCondition = (searchTerm: string, searchBy: string) => {
        const searchValue = {
          contains: searchTerm,
          mode: "insensitive" as const,
        };
        switch (searchBy) {
          case "TITLE":
            return { title: searchValue };
          case "CREATOR":
            return { contentCreater: searchValue };
          case "CHANNEL":
            return { channelName: searchValue };
          case "URL":
            return { youtube_url: searchValue };
          default:
            return { title: searchValue };
        }
      };

      const searchCondition = getSearchCondition(searchTerm, searchBy);

      try {
        const totalCount = await prisma.note.count({ where: searchCondition });
        const totalPages = Math.ceil(totalCount / validLimit);

        const notes = await prisma.note.findMany({
          where: searchCondition,
          skip: offset,
          take: validLimit,
          orderBy: { createdAt: "desc" },
          include: {
            likes: {
              where: {
                userId: context.user.uid,
                liked: true,
              },
            },
            savedByMe: {
              where: {
                userId: context.user.uid,
              },
            },
            user: {
              select: {
                profilePic: true,
              },
            },
          },
        });

        const formattedNotes = notes.map((note) => ({
          ...note,
          savedByMe: note.savedByMe.length > 0,
          likedByMe: note.likes.length > 0,
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        }));

        return {
          notes: formattedNotes,
          totalCount,
          totalPages,
          currentPage: validPage,
          hasNextPage: validPage < totalPages,
          hasPreviousPage: validPage > 1,
        };
      } catch (error: any) {
        console.error("Error searching notes:", error.message);
        throw new Error("Failed to search notes");
      }
    },
  },

  Mutation: {
    createNotes: async (
      _: unknown,
      {
        title,
        youtube_url,
        pdf_url,
        contentCreater,
        thumbnail,
        channelName,
      }: CreateNotesArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Validate required fields
      if (!title.trim() || !youtube_url.trim() || !pdf_url.trim()) {
        throw new Error("Title, YouTube URL, and PDF URL are required");
      }

      try {
        await prisma.note.create({
          data: {
            title: title.trim(),
            youtube_url: youtube_url.trim(),
            pdf_url: pdf_url.trim(),
            contentCreater: contentCreater?.trim() || null,
            thumbnail: thumbnail?.trim() || null,
            channelName: channelName?.trim() || null,
            userId: context.user.uid,
          },
        });

        
        

        return true;
      } catch (error: any) {
        console.error("Error creating note:", error.message);
        throw new Error("Failed to create note");
      }
    },
    // Replace your deleteNotes mutation with this:

deleteNotes: async (
  _: unknown,
  { noteId }: { noteId: string },
  context: Context
) => {
  // Check authentication
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  console.log("Delete operation:", { noteId, userId: context.user.uid });

  try {
    // First, verify the note exists and belongs to the user
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    // Check if user owns the note
    if (note.userId !== context.user.uid) {
      throw new Error("Unauthorized: You can only delete your own notes");
    }

    // Delete related records first (if cascade is not set in schema)
    await prisma.$transaction([
      // Delete all likes associated with this note
      prisma.like.deleteMany({
        where: { noteId },
      }),
      // Delete all saved references
      prisma.savedNote.deleteMany({
        where: { noteId },
      }),
      // Delete all views associated with this note
      prisma.view.deleteMany({
        where: { noteId },
      }),
      // Finally delete the note
      prisma.note.delete({
        where: { id: noteId },
      }),
    ]);

    // Invalidate cache after deletion
     await invalidateAllNoteCaches();


    console.log("✅ Note deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Delete operation failed:", error.message);
    throw new Error(`Failed to delete note: ${error.message}`);
  }
},

    likeNotes: async (
      _: unknown,
      { noteId, liked }: LikeNotesArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      console.log("Like operation:", { noteId, liked, userId: context.user.uid });

      try {
        await prisma.$transaction([
          prisma.like.upsert({
            where: {
              userId_noteId: {
                noteId,
                userId: context.user.uid,
              },
            },
            update: {
              liked,
            },
            create: {
              noteId,
              userId: context.user.uid,
              liked,
            },
          }),
          prisma.note.update({
            where: {
              id: noteId,
            },
            data: {
              likesCount: {
                [liked ? "increment" : "decrement"]: 1,
              },
            },
          }),
        ]);

        // Invalidate cache after like changes
      

        console.log("✅ Like operation successful");
        return true;
      } catch (error: any) {
        console.error("Like operation failed:", error.message);
        throw new Error("Failed to update like status");
      }
    },

    saveNote: async (
      _: unknown,
      { noteId, saved }: SaveNoteArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      try {
        if (saved) {
          await prisma.savedNote.create({
            data: {
              userId: context.user.uid,
              noteId,
            },
          });
        } else {
          await prisma.savedNote.deleteMany({
            where: {
              userId: context.user.uid,
              noteId,
            },
          });
        }

        // Optionally invalidate cache after save changes
       

        return true;
      } catch (error: any) {
        console.error("Error saving note:", error.message);
        throw new Error("Failed to save note");
      }
    },
  },
};