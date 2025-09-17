'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from "firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { auth } from '@/lib/firebase/auth';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Bounce, toast } from 'react-toastify';
import { Loader2 } from "lucide-react"; // 👈 spinner icon from lucide-react

const formSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

const SignIn = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 👈 state for loader

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true); // start loader
    try {
      const authUser = await signInWithEmailAndPassword(auth, values.email, values.password);

      toast.success('You have Successfully logged in', {
        position: "top-right",
        autoClose: 1999,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });

      console.log('authUser', authUser);
      router.push('/home');
    } catch (error: any) {
      toast.error('You have not registered yet', {
        position: "top-right",
        autoClose: 1999,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      setError(error.message);
    } finally {
      setLoading(false); // stop loader
    }
  }

  return (
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
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='cursor-pointer' type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* spinner */}
              Signing in...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  )
}

export default SignIn;
