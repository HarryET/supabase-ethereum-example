import type { NextPage } from 'next'
import React from "react";

const Home: NextPage = () => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <div className='bg-red-200 border-2 border-red-400 text-gray-700 px-2 py-4 rounded-xl'>
      <span className='font-medium'>Note:</span> This demo has now been <span className='font-medium underline'>suspended</span>. Once there is a new demo for Supabase & WalletConnect this same domain will be used. Keep your eyes pealed 👀
      </div>
    </div>
  )
}

export default Home;
