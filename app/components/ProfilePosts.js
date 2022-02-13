import Axios from "axios"
import React, { useEffect, useState } from "react"
import {useParams, Link} from 'react-router-dom'
import LoadingDotsIcons from "./LoadingDotsIcons"
import Post from './Post'

function ProfilePost() {
    const {username} = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPost] = useState([])

    useEffect(()=>{
        const ourRequest = Axios.CancelToken.source()

        async function fetchPost() {
           try{
            const response = await Axios.get(`/profile/${username}/posts`, {cancelToken: ourRequest.token})
            setPost(response.data)
            
            setIsLoading(false)
           } catch(e){
            console.log("there was an error")
           } 
        }
        fetchPost()
        return () =>{
            ourRequest.cancel()
        }
    }, [username])

    if (isLoading) return <LoadingDotsIcons />

  return (
    
      <div className="list-group">
        {posts.map(post=>{
           return <Post noAuthor={true} post={post} key={post._id}/>
        })}
       
      </div>
    
  )
}

export default ProfilePost