"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CardDemo() {

    const {isLoaded , signUp , setActive} = useSignUp()
    const [emailAddress , setemailaddress] = useState<string>("")
    const [password , setpassword] = useState<string>("")
    const [pendingVerification , setpendingVerification] = useState<Boolean>(false)
    const [code , setCode] = useState<string>("")
    const [error , seterror] = useState<string>("")
    const [showPassword , setShowPassword] = useState<boolean>(false)

    const router = useRouter()


    if(!isLoaded){
        return null
    }

    async function submit(e : React.FormEvent){
        e.preventDefault()
        if(!isLoaded){
            return
        }

        try {
            await signUp.create({
                emailAddress,
                password
            })

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setpendingVerification(true)


        } catch (error:any) {

            console.log(JSON.stringify(error , null , 2));
            seterror(error.errors[0].message)
        }






    }

    async function onPressVerify(e:React.FormEvent){
        e.preventDefault()
        if(!isLoaded){
            return
        }

        try{
           const completeSignup =  await signUp.attemptEmailAddressVerification({code})

           if(completeSignup.status !== "complete"){
            console.log(JSON.stringify(completeSignup , null , 2));
           }

           if(completeSignup.status === "complete"){
            await setActive({session : completeSignup.createdSessionId})
            router.push("/dashboard")            
           }


        }
        catch(err:any){
            console.log(JSON.stringify(err , null , 2));
            seterror(err.errors[0].message)
            
        }



    }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up for Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setemailaddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Verify Email
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
  
}
