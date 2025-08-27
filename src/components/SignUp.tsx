
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
  email: z.string().email("Invalid email format"),
 password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Points to the confirmPassword field for the error

});

const SignUp = () => {
  const CREATE_USER=gql`
  mutation CreateUser($name:String!,$email:String!,$password:String!){
  createUser(name:$name,email:$email,password:$password)
  }`
    const router=useRouter();
    const [error,setError]=useState('');
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password:"",
      confirmPassword:""
    },
  })
 
 const [createUserMutation]=useMutation(CREATE_USER)
  function onSubmit(values: z.infer<typeof formSchema>) {
   
    console.log(values)
     
      createUserWithEmailAndPassword(auth,values.email, values.password)
      .then(async (authUser) => {
        console.log("Success. The user is created in Firebase")
        console.log('authUser',authUser);
         await createUserMutation({
        variables: {
          name: values.email.split("@")[0], // or add a name field to form
          email: values.email,
          password: values.password,
        },
      });
      console.log('Successfully Inserted in database');
        // router.push("/dashboard");
      })
      .catch(error => {
        
        setError(error.message)
      });
    }
   
  
  


  return (
    <div>
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" {...field} />
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

export default SignUp;