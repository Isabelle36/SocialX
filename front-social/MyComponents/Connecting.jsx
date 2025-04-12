import React from 'react'
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"



const Connecting = () => {
  return (
    <div className='bg-black h-screen'>
    <h1 className='text-4xl pt-7 text-white/60 font-sans text-center'>Manage Accounts</h1>
    <Separator className="bg-white/30 mt-[3%] w-full"/>
    <Button variant="outline" className="hover:bg-white/80 cursor-pointer mt-[2%] m-[3%]">+ Add account</Button>


    </div>
  )
}

export default Connecting