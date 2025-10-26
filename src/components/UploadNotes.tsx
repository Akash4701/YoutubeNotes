'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import gql from 'graphql-tag';
import { useLazyQuery, useMutation} from "@apollo/client/react"
import { Supadata, YoutubeVideo } from '@supadata/js';
import axios from 'axios';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast, Zoom } from 'react-toastify';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Name is required' }),
  thumbnail: z.string().optional(),
  creater: z.string().min(1, { message: 'Creator name is required' }),
  channelName: z.string().min(1, { message: 'Channel Name is required' }),
  notes: z.instanceof(File, { message: "File is required." })
})

// GraphQL Queries/Mutations
const CREATE_NOTE = gql`
  mutation CreateNotes(
    $title: String!
    $youtube_url: String!
    $pdf_url: String!
    $contentCreater: String!
    $thumbnail: String
    $channelName: String!
  ) {
    createNotes(
      title: $title
      youtube_url: $youtube_url
      pdf_url: $pdf_url
      contentCreater: $contentCreater
      thumbnail: $thumbnail
      channelName: $channelName
    )
  }
`

const GET_NOTES = gql`
  query GetNotes(
    $page: Int
    $limit: Int
    $sortBy: SortOrder
    $saveCache: Boolean
  ) {
    getNotes(
      page: $page
      limit: $limit
      sortBy: $sortBy
      saveCache: $saveCache
    ) {
      notes {
        id
        title
        youtube_url
        pdf_url
        thumbnail
        contentCreater
        channelName
        likesCount
        viewsCount
        likedByMe
        savedByMe
        createdAt
        updatedAt
      }
      totalCount
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
`

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

  const res = await axios.post(url, formData);
  
  console.log('Cloudinary response:', res);
  console.log('Uploaded successfully to Cloudinary')
  
  return res.data.secure_url;
}

const UploadNotes = () => {
  const supadata = new Supadata({
    apiKey: process.env.NEXT_PUBLIC_SUPDATA_API_KEY as string,
  });

  const router = useRouter();
  
  const [createNotesMutation] = useMutation(CREATE_NOTE);
  const [getNotesQuery] = useLazyQuery(GET_NOTES); // Using useMutation to manually trigger
  
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [autoloader, setAutoloader] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      thumbnail: "",
      channelName: "",
      creater: "",
      notes: undefined
    },
  })

  // Auto Extract function
  const AutoExtract = async (url: string) => {
    if (!url) return;
    
    setAutoloader(true);
    try {
      const video: YoutubeVideo = await supadata.youtube.video({ id: url });

      form.setValue("thumbnail", video.thumbnail || "");
      form.setValue("title", video.title || "");
      form.setValue("channelName", video.channel?.name || "");
      
    } catch (error) {
      console.error("Error fetching video details:", error);
    } finally {
      setAutoloader(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log("Final form values:", values);

    try {
      // Upload to Cloudinary
      const fileUrl = await uploadToCloudinary(values.notes);
      console.log("File uploaded to:", fileUrl);

      // Create note in database
      const { data } = await createNotesMutation({
        variables: {
          title: values.title,
          youtube_url: youtubeUrl,
          pdf_url: fileUrl,
          contentCreater: values.creater,
          thumbnail: values.thumbnail || "",
          channelName: values.channelName
        }
      });

      if (data?.createNotes) {
        console.log("✅ Note created successfully");

        // Trigger cache rebuild by calling getNotes with saveCache=true
        try {
          await getNotesQuery({
            variables: {
              page: 1,
              limit:9 ,
              sortBy: "CREATED_AT_DESC",
              saveCache: true // This rebuilds the cache without returning data
            }
          });
          console.log("✅ Cache rebuilt successfully");
        toast.success('Successfully Uploaded your Note', {
position: "top-right",
autoClose: 5000,
hideProgressBar: false,
closeOnClick: false,
pauseOnHover: true,
draggable: true,
progress: undefined,
theme: "dark",
transition: Zoom,
});
        } catch (cacheError) {
          console.error("⚠️ Cache rebuild error:", cacheError);
          // Don't block the success flow if cache rebuild fails
        }

        // Navigate to home
        router.push('/home');
      }
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      alert(error.message || "Failed to upload notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 text-center">Upload YouTube Notes</h1>
      
      {/* YouTube URL input */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter YouTube link"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <Button
          type="button"
          onClick={() => AutoExtract(youtubeUrl)}
          disabled={autoloader}
        >
          {autoloader ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter YouTube Video title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Creator */}
          <FormField
            control={form.control}
            name="creater"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Creator</FormLabel>
                <FormControl>
                  <Input placeholder="Enter YouTube Channel Author" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Thumbnail (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="YouTube Video Thumbnail URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Channel Name */}
          <FormField
            control={form.control}
            name="channelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter YouTube Channel Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes Upload */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Notes</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      field.onChange(e.target.files?.[0]);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full cursor-pointer" 
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default UploadNotes;