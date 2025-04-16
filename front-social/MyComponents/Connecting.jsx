'use client'
import React from 'react'
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const Connecting = () => {
  const handleInstagramLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
    const scope = 'user_profile,user_media'
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`

    window.location.href = authUrl
  }

  return (
    <div className='bg-black h-screen'>
      <h1 className='text-4xl pt-7 text-white/60 font-sans text-center'>Manage Accounts</h1>
      <Separator className="bg-white/30 mt-[3%] w-full" />
      <Button
        variant="outline"
        className="hover:bg-white/80 cursor-pointer mt-[2%] m-[3%]"
        onClick={handleInstagramLogin}
      >
        + Add account
      </Button>
    </div>
  )
}

export default Connecting
