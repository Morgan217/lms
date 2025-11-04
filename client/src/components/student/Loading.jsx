import React, { useEffect } from 'react'
import { useNavigate,useParams } from 'react-router-dom'

function Loading() {

  const {path}= useParams()
  const navigate=useNavigate();

  useEffect(()=>{
    if(path){
      const timer=setTimeout(()=>{
        navigate(`/${path}`)
      },5000)
    }

  },[])
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className=' w-26 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
      <h1>Loading please wait </h1>
    </div>
  )
}

export default Loading
