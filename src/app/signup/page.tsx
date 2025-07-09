"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import axios, { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(40,{message :"Name must be at most 40 characters"}),
    email: z.string().email({ message: "Please enter a valid email address" }),
  })


type FormData = z.infer<typeof formSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify'>('form')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const handleEmailVerification = async (email: string) => {
    try {
      const response = await axios.post('/api/auth/verify-email', {email })
      if (response.data.success) {
        setVerificationEmail(email)
        setVerificationStep('verify')
      } else {
        setError(response.data.error || 'Failed to send verification email')
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.error)
      } else {
        setError('Failed to send verification email')
      }
    }
  }

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('/api/auth/verify-email', {
        email: verificationEmail,
        otp,
      })

      if (response.data.success) {

        // setVerificationStep('form')
        // Continue with registration
        const formData = form.getValues()
        await handleRegistration(formData)
      } else {
        setVerificationError(response.data.error || 'Invalid verification code')
      }
    } catch (error) {
      if (error instanceof AxiosError) {

        setVerificationError(error.response?.data.error)
      } else {
        setVerificationError('Failed to verify email')
      }
    }
  }

  const handleRegistration = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post("/api/auth/register", {
        name: data.name,
        email: data.email,
      })

      if (response.status !== 201) {
        throw new Error(response.data.error || "Something went wrong")
      }
      router.push("/signin")
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.error)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await handleEmailVerification(data.email)
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.error)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: "google" ) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {verificationStep === 'form' ? 'Create an account' : 'Verify your email'}
          </CardTitle>
          <CardDescription>
            {verificationStep === 'form'
              ? 'Enter your information to create an account'
              : 'Enter OTP sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationStep === 'form' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Gaurav Joshi" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button type="submit" className="w-full" disabled={isLoading} variant={"secondary"}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                We&apos;ve sent OTP to {verificationEmail}
              </div>
              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                  className="mt-1 text-center text-2xl tracking-widest"
                />
                {verificationError && (
                  <p className="text-sm text-destructive">{verificationError}</p>
                )}
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={isLoading || !otp}
                variant={"secondary"}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setVerificationStep('form')
                  setOtp('')
                  setVerificationError(null)
                }}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button 
            variant="outline" 
            type="button" disabled={isLoading} 
            onClick={() => handleOAuthSignIn("google")}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 border-gray-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

