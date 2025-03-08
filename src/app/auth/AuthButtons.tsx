"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";
const AuthButtons = () => {
  const [isloading,setisLoading] = useState(false)
  return (
    <div className='flex gap-3 w-full md:w-auto md:flex-row flex-col relative z-50'>
        <RegisterLink className='flex-1' onClick={()=>setisLoading(true)}>
        <Button className='w-full md:w-40 cursor-pointer' variant={"outline"} disabled={isloading}>
            Sign Up
        </Button>
        </RegisterLink>
        <LoginLink className='flex-1' onClick={()=>setisLoading(true)}>

        <Button className='w-full md:w-40 cursor-pointer' disabled={isloading}>Log In</Button>
        </LoginLink>
    </div>
  )
}

export default AuthButtons
