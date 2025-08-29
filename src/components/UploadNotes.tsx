
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { auth } from '@/lib/firebase/auth';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import gql from 'graphql-tag';
import {useMutation} from "@apollo/client/react"




const formSchema = z.object({
  title: z.string().min(1, { message: 'Name is required' }),
  youtube_url: z.url("Invalid URL format"),
 creater: z.string().min(1, { message: 'Creater name is required' }),
 channelName: z.string().min(1, { message: 'Channel Name is required' }),   
notes:z.instanceof(File, { message: "File is required." })
  
})




const UploadNotes = () => {
  const CREATE_USER=gql`
  mutation CreateUser($name:String!,$email:String!,$password:String!){
  createUser(name:$name,email:$email,password:$password)
  }`
    const router=useRouter();
    const [error,setError]=useState('');
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtube_url:"",
      title: "",
      channelName:"",
      creater:"",
        notes:undefined
    },
  })
 
 
  function onSubmit(values: z.infer<typeof formSchema>) {
   
    console.log(values)
     
     
      
    }
   
  
  


  return (
    <div>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="youtube_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube Url</FormLabel>
              <FormControl>
                <Input placeholder="Enter youtube link" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video title</FormLabel>
              <FormControl>
                <Input placeholder="Enter youtube Video title" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creater"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Creater</FormLabel>
              <FormControl>
                <Input placeholder="Enter youtube Channel Author" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="channelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube Channel</FormLabel>
              <FormControl>
                <Input placeholder="Enter Youtube Channel Name" {...field} />
              </FormControl>
              
              <FormMessage />
            </FormItem>
          )}
        />
       
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
            // Pass file to RHF
            field.onChange(e.target.files?.[0]);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

        <Button type="submit">Submit</Button>
      </form>
    </Form>
    
    </div>
  )
}

export default UploadNotes;