import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const noteTypeDefs = gql`
  type Notes {
    id: ID!
    title: String!
    youtube_url: String!
    pdf_url: String!
    userId: ID!
    likesCount:Int
    contentCreater: String
    thumbnail: String
    channelName: String
    
    createdAt: String!
    updatedAt: String!
    likedByMe:Boolean!
  }

  type likes{
  id:ID!
  noteId: ID!
  userId: ID!
  liked: Boolean
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
    getNotes(
      page: Int = 1
      limit: Int = 10
      sortBy: SortOrder = CREATED_AT_DESC
    ): NotesResponse!
    
    searchNotes(
      searchTerm: String!
      searchBy: SearchField = TITLE
      page: Int = 1
      limit: Int = 10
    ): NotesResponse!
  }

  extend type Mutation {

  likeNotes(
   noteId: ID!
  
  liked: Boolean
):Boolean!

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
    getNotes: async (
      _: any,
      { page, limit, sortBy }: { page: number; limit: number; sortBy: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const validLimit = Math.min(Math.max(limit, 1), 50);
      const validPage = Math.max(page, 1);
      const offset = (validPage - 1) * validLimit;

      const getOrderBy = (sortBy: string) => {
        switch (sortBy) {
          case "LIKES_DESC":
            return [{ likes : { _count: "desc" } }];
          case "LIKES_ASC": 
            return [{ likes: { _count: "asc" } }];
          case "CREATED_AT_DESC":
            return [{ createdAt: "desc" }];
          case "CREATED_AT_ASC":
            return [{ createdAt: "asc" }];
          case "UPDATED_AT_DESC":
            return [{ updatedAt: "desc" }];
          case "UPDATED_AT_ASC":
            return [{ updatedAt: "asc" }];
          case "TITLE_ASC":
            return [{ title: "asc" }];
          case "TITLE_DESC":
            return [{ title: "desc" }];
          default:
            return [{ createdAt: "desc" }];
        }
      };

      try {
        const totalCount = await prisma.note.count();
        const totalPages = Math.ceil(totalCount / validLimit);

        // Fetch notes with likes count
        const notes = await prisma.note.findMany({
          skip: offset,
          take: validLimit,
          orderBy: getOrderBy(sortBy),
          include: {
            
          
            likes: {
              where: { userId: context.user.uid, liked: true }
            }
          },
        });

        const formattedNotes = notes.map((note) => ({
          ...note,
          
          likedByMe: note.likes.length > 0 && note.likes[0].liked === true, // count only "liked: true" for current user
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
      } catch (error) {
        console.error("Error fetching notes:", error);
        throw new Error("Failed to fetch notes");
      }
    },

    searchNotes: async (
      _: any,
      { searchTerm, searchBy, page, limit }: { 
        searchTerm: string; 
        searchBy: string; 
        page: number;
        limit: number;
      },
      context: any
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

      const getSearchCondition = (searchTerm: string, searchBy: string) => {
        const searchValue = { contains: searchTerm, mode: "insensitive" as const };
        switch (searchBy) {
          case "TITLE": return { title: searchValue };
          case "CREATOR": return { contentCreater: searchValue };
          case "CHANNEL": return { channelName: searchValue };
          case "URL": return { youtube_url: searchValue };
          default: return { title: searchValue };
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
          orderBy: [{ createdAt: "desc" }],
          include: {
           
          likes:{
            where: { userId: context.user.uid, liked: true }
          }

          },
        });

        const formattedNotes = notes.map((note) => ({
          ...note,
         
          likedByMe:  note.likes.length > 0 , // count only "liked: true" for current user
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
      } catch (error) {
        console.error("Error searching notes:", error);
        throw new Error("Failed to search notes");
      }
    },
  },

  Mutation: {
    createNotes: async (
      _: any,
      { 
        title, 
        youtube_url, 
        pdf_url, 
        contentCreater, 
        thumbnail, 
        channelName 
      }: {
        title: string;
        youtube_url: string;
        pdf_url: string;
        contentCreater?: string;
        thumbnail?: string;
        channelName?: string;
      },
      context: any
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
            userId: context.user.uid
          }
        });

        return true;
      } catch (error) {
        console.error('Error creating note:', error);
        throw new Error('Failed to create note');
      }
    },

    likeNotes:async(_:any,
      {
        noteId,liked
      }:{
        noteId:string,liked:boolean
      },context:any)=>{
        if(!context.user){
          throw new Error("Not authenticated");
        }
         console.log('object, noteId,liked', noteId,liked);

        try{
          const results=await prisma.$transaction([
              prisma.like.upsert({
            where:{
              userId_noteId:{
                 noteId,
              userId:context.user.uid

              }
              
             
            },
            update:{
              liked

            },
            create:{
              noteId,
              userId:context.user.uid,
              liked
            }

          }),
          liked ?(
              prisma.note.update({
              where:{
                id:noteId
              },
              data:{
                likesCount:{
                  increment:1
                }
              }
             })
            )

          :(
             prisma.note.update({
              where:{
                id:noteId
              },
              data:{
                likesCount:{
                  decrement:1
                }
              }
            })
          )
         


          ])
         
          console.log('Liked successfully');
          return true

        }catch(err){
          console.log('like status not working',err.message)
        }


      }

    
  }
};