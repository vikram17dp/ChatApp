import { Button } from '@/components/ui/button'
import React from 'react'

const AuthButtons = () => {
  return (
    <div className='flex gap-3 w-full md:w-auto md:flex-row flex-col relative z-50'>
        <Button className='w-full md:w-40 cursor-pointer' variant={"outline"}>
            Sign Up
        </Button>
        <Button className='w-full md:w-40 cursor-pointer'>Log In</Button>
    </div>
  )
}

export default AuthButtons
