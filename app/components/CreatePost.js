import React, {useEffect, useState, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import {useNavigate} from 'react-router-dom'
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function CreatePost(props) {
    const [title, setTite]=useState()
    const [body, setBody]= useState()
    const navigate = useNavigate()
    const appDispatch = useContext(DispatchContext)
    const appState = useContext(StateContext)
    
    async function handleSubmit(e){
        e.preventDefault()
        try{
            const response = await Axios.post("/create-post", {title: title, body: body, token: appState.user.token})
            appDispatch({type: "flashMessage", value: "Congrats, you createed a new post."})
            navigate(`/post/${response.data}`)
        }catch(e){
            console.log("there was an error")
        }
    }

  return (
    <Page title="Create new Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e => setTite(e.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e => setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button  className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  )
}

export default CreatePost