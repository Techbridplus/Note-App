"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import axios, { AxiosError } from "axios"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [otpsent, setOtpsent] = useState(false)

  const handleEmailVerification = async () => {
    setIsLoading(true)
    setError(null)
    setEmail(email.toLowerCase())
    try {
      const response = await axios.post('/api/auth/signin', { email })
      if (response.data.success) {
        setIsLoading(false)
        setOtpsent(true)
      } else {
        setError(response.data.error || 'Failed to send verification email')
      }
    } catch (error) {
      if (error instanceof AxiosError) {

        setError(error.response?.data.error)
        setIsLoading(false)
      } else {
        setError('Failed to send verification email')
      }
    }finally{

    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        otp,
      })
      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${error}`)
    } 
    finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google") => {
    setIsLoading(true)
    try {
      await signIn(provider, {
        callbackUrl: "https://note-app-beryl-beta.vercel.app",
      })
    } catch (error) {
      setError(`An unexpected error occurred: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {otpsent ? <><div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="xyzabc"
                disabled={isLoading}
                className="mt-1 text-center text-2xl tracking-widest"
              />
            </div>
              <Button type="submit" className="w-full" disabled={isLoading} variant={"secondary"}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button></> :
              <Button onClick={handleEmailVerification} className="w-full" disabled={isLoading} variant={"secondary"}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>}


          </form>

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
              className="w-full flex items-center justify-center space-x-2 dark:text-white bg-white hover:bg-gray-50 text-gray-900 border-gray-300">
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
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>


    </div>
  )
}

