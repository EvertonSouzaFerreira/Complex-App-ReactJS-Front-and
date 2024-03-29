import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import Axios from "axios"
import {useParams, Link, useNavigate} from "react-router-dom"
import LoadingDotsIcons from "./LoadingDotsIcons"
import  ReactMarkdown  from "react-markdown"
import ReactTooltip from "react-tooltip"
import NotFound from "./NotFound"


function ViewSinglePost() {
    const navigate = useNavigate()
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const [isLoading, setIsLoading] = useState(true)
    const {id} = useParams()
    const [post, setPost] = useState()

    useEffect(()=>{
        const ourRequest = Axios.CancelToken.source()
        async function fetchPost() {
           try{
            const response = await Axios.get(`/post/${id}`, {cancelToken: ourRequest.token})
            setPost(response.data)
            
            setIsLoading(false)
           } catch(e){
            console.log("there was an error")
           } 
        }
        fetchPost()
        return (
            () => {
                ourRequest.cancel()
            }
        )
    }, [id])

    if (!isLoading && !post) {
        return <NotFound />
    }
    
    if (isLoading){
        return (
            <Page title="...">
                <LoadingDotsIcons />
            </Page>
        )
    }
        
    const date = new Date(post.createdDate)
    const dateFormatted = `${date.getMonth() +1}/ ${date.getDate()}/${date.getFullYear()}`

    function isOwner() {
        if (appState.loggedIn){
            return appState.user.username == post.author.username
        }
        return false

    }

    async function deleteHandler(){
        const areYouSure = window.confirm("Do you really want to delete this post")
        if (areYouSure) {
            try {
                const response = await Axios.delete(`/post/${id}`, {data: {token: appState.user.token}})
                if(response.data == "Success") {
                    appDispatch({type: "flashMessage", value: "Post was successfully deleted."})
                    navigate(`/profile/${appState.user.username}`)
                }

            }catch(e){
                console.log("There was a problem")
            }
        }
    }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
            <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2" >
                <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip"/> {" "}
            <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger" >
                <i className="fas fa-trash"></i>
          </a>
          <ReactTooltip id="delete" className="custom-tooltip"/>
         
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={appState.user.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
      </div>
    </Page>
  )
}

export default ViewSinglePost