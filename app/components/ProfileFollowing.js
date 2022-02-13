import Axios from "axios"
import React, { useEffect, useState } from "react"
import {useParams, Link} from 'react-router-dom'
import LoadingDotsIcons from "./LoadingDotsIcons"

function ProfileFollowing() {
    const {username} = useParams()
    const [isLoading, setIsLoading] = useState(true)
    const [posts, setPost] = useState([])

    useEffect(()=>{
        const ourRequest = Axios.CancelToken.source()

        async function fetchPost() {
           try{
            const response = await Axios.get(`/profile/${username}/following`, {cancelToken: ourRequest.token})
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
        {posts.map((follower, index)=>{

            return(
                <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
        </Link>
            )
        })}
       
      </div>
    
  )
}

export default ProfileFollowing