import React, { useEffect, useContext, useState } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

import Axios from "axios"
import {useParams, Link, useNavigate} from "react-router-dom"
import LoadingDotsIcons from "./LoadingDotsIcons"


function EditPost() {
    const navigate = useNavigate()
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)

    const originalState = {
        title: {
            value: "",
            hasErrors: false,
            message: ""
        },
        body: {
            value: "",
            hasErrors: false,
            message: ""
        },
        isFetching: true,
        isSaving: false,
        id: useParams().id,
        sendCount: 0,
        notFound: false,
    }

    function ourReducer(draft, action){
        switch (action.type) {
            case "fetchComplete":
                draft.title.value = action.value.title
                draft.body.value = action.value.body
                draft.isFetching = false
                return
            case "titleChange":
                draft.title.hasErrors = false
                draft.title.value = action.value
                return
            case "bodyChange":
                draft.body.hasErrors = false
                draft.body.value = action.value
                return
            case "submitRequest":
                if (!draft.title.hasErrors && !draft.body.hasErrors){
                    draft.sendCount++
                }
                return
            case "saveRequestStarted":
                draft.isSaving = true
                return
            case "saveRequestFinished":
                draft.isSaving = false
            return
            case "titleRules":
                if (!action.value.trim()){
                    draft.title.hasErrors = true
                    draft.title.message = "You must provide a title."
                }
            return
            case "bodyRules":
                if (!action.value.trim()){
                    draft.body.hasErrors = true
                    draft.body.message = "You must provide a subject."
                }
            return
            case "notFound":
                draft.notFound = true
                return
        }
    }

    const [state,dispatch] = useImmerReducer(ourReducer, originalState)

    function submitHandle(e){
        e.preventDefault()
        dispatch({type: "titleRules", value: state.title.value})
        dispatch({type: "bodyRules", value: state.body.value})
        dispatch({type: "submitRequest"})
    }
   

    useEffect(()=>{
        const ourRequest = Axios.CancelToken.source()
        async function fetchPost() {
           try{
            const response = await Axios.get(`/post/${state.id}`, {cancelToken: ourRequest.token})
            if(response.data){
                dispatch({type: "fetchComplete", value: response.data})
                if (appState.user.username != response.data.author.username){
                    appDispatch({type: "flashMessage", value: "You do not hae permition to change this post"})
                    //rediret.to.homepage
                    navigate("/")
                }
            }else{
                dispatch({type: "notFound"})
            }
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
    }, [])

    useEffect(()=>{
        if(state.sendCount){
        dispatch({type: "saveRequestStarted"})
        const ourRequest = Axios.CancelToken.source()
        async function fetchPost() {
           try{
            const response = await Axios.post(`/post/${state.id}/edit`, {title: state.title.value, body: state.body.value, token: appState.user.token}, {cancelToken: ourRequest.token})
           dispatch({type: "saveRequestFinished"})
           appDispatch({type: "flashMessage", value: "post was updated"})
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
        }
    }, [state.sendCount])

    if(state.notFound) {
        return(
            <NotFound />
        )
    }
    
    if (state.isFetching){
        return (
            <Page title="...">
                <LoadingDotsIcons />
            </Page>
        )
    }
        
    
  return (
    <Page title="Edit Post">
        <Link className="small fron-weight-bold" to={`/post/${state.id}`}>
            &laquo; Back to post permalink
        </Link>
      <form className="mt-3" onSubmit={submitHandle} >
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({type: "titleRules", value: e.target.value})} onChange={e => dispatch({type: "titleChange", value: e.target.value})} value={state.title.value}  autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors &&
            <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>
          }
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({type: "bodyRules", value: e.target.value})} onChange={e => dispatch({type: "bodyChange", value: e.target.value})} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
          {state.body.hasErrors &&
            <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>
          }
        </div>

        <button  className="btn btn-primary" disabled={state.isSaving}>Save Update</button>
      </form>
    </Page>
  )
}

export default EditPost