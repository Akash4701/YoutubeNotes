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
    LIKES_DESC
    LIKES_ASC
    CREATED_AT_DESC
    CREATED_AT_ASC
    UPDATED_AT_DESC
    UPDATED_AT_ASC
    TITLE_ASC
    TITLE_DESC
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
      limit: Int = 10
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
  }
`;

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
      console.log("Query params:", { page, limit, userId, saved, userliked, saveCache });

      const cacheKey = `note:page:${page}`;

      // Check cache for page 1 (only when not rebuilding cache)
      if (page === 1 && !saveCache) {
        try {
          const cached = await redis.get(cacheKey);
          console.log('cacheKey',cacheKey);
          console.log('cache data',cached);

          if (cached) {
            console.log("🚀 Served from Redis cache");
            const cachedData = JSON.parse(cached);
            return cachedData;
          }
        } catch (error) {
          console.error("Redis cache read error:", error);
          // Continue to fetch from database if cache fails
        }
      }

      // Build where clause
      const whereClause: any = userId ? { userId } : {};

      if (saved) {
        whereClause.savedByMe = {
          some: { userId: context.user.uid },
        };
      }

      if (userliked) {
        whereClause.likes = {
          some: {
            userId: context.user.uid,
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
          case "LIKES_DESC":
            return { likes: { _count: "desc" } };
          case "LIKES_ASC":
            return { likes: { _count: "asc" } };
          case "CREATED_AT_DESC":
            return { createdAt: "desc" };
          case "CREATED_AT_ASC":
            return { createdAt: "asc" };
          case "UPDATED_AT_DESC":
            return { updatedAt: "desc" };
          case "UPDATED_AT_ASC":
            return { updatedAt: "asc" };
          case "TITLE_ASC":
            return { title: "asc" };
          case "TITLE_DESC":
            return { title: "desc" };
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

        // Cache page 1 results
        if (page === 1 && saveCache) {
          try {
            await redis.set(cacheKey, JSON.stringify(response), { ex: 300 });
            console.log("💾 Page 1 cached in Redis");
            
          } catch (error) {
            console.error("Redis cache write error:", error);
            // Don't throw - caching failure shouldn't break the request
          }
        }

        // // If saveCache is true, return null (used for cache rebuild)
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
        try {
          await updatePage1Cache({ rebuild: true });
          console.log("✅ Cache invalidated after like operation");
        } catch (cacheError) {
          console.error("Cache invalidation error:", cacheError);
        }

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
        try {
          await updatePage1Cache({ rebuild: true });
          console.log("✅ Cache invalidated after save operation");
        } catch (cacheError) {
          console.error("Cache invalidation error:", cacheError);
        }

        return true;
      } catch (error: any) {
        console.error("Error saving note:", error.message);
        throw new Error("Failed to save note");
      }
    },
  },
};