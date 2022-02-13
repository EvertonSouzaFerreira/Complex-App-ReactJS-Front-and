import React, {useState, useReducer, useEffect, Suspense} from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {CSSTransition} from "react-transition-group"
import  Axios  from "axios";
Axios.defaults.baseURL = process.env.BACKENDURL || "https://course-react-back-and.herokuapp.com"

//My components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import Terms from "./components/Terms";
import Home from "./components/Home";
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Search = React.lazy(() => import("./components/Search"))
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Chat  from "./components/Chat"

import DispatchContext from "./DispatchContext";
import StateContext from "./StateContext";
import LoadingDotsIcons from "./components/LoadingDotsIcons";


function Main(){
    const initialState = {
        loggedIn: Boolean(localStorage.getItem("complexappToken")),
        flashMessages: [],

        user: {
            token: localStorage.getItem("complexappToken"),
            username: localStorage.getItem("complexappUsername"),
            avatar: localStorage.getItem("complexappAvatar")
        },
        isSearch: false,
        isChat: false,
        unreadChatCount: 0
    }

    function ourReducer(draft, action){
        switch (action.type){
            case "login":
                draft.loggedIn = true
                draft.user = action.data
                return
            case "logout":
                draft.loggedIn = false
                return
            case "flashMessage":
                draft.flashMessages.push(action.value)
                return
            case "openSearch":
                draft.isSearch = true
                return
            case "closeSearch":
                draft.isSearch = false
                return
            case "toggleChat":
                draft.isChat = !draft.isChat
                return
            case "closeChat":
                draft.isChat = false
                return
            case "incrementUnreadChatCount":
                draft.unreadChatCount++
                return
            case "clearUnreadChatCount":
                draft.unreadChatCount = 0
                return
        }
    }


    const [state, dispatch] = useImmerReducer(ourReducer, initialState)

    useEffect(() => {
        if (state.loggedIn) {
            localStorage.setItem("complexappToken", state.user.token)
            localStorage.setItem("complexappUsername", state.user.username)
            localStorage.setItem("complexappAvatar", state.user.avatar)
        }else{
            localStorage.removeItem("complexappToken")
                localStorage.removeItem("complexappUsername")
                localStorage.removeItem("complexappAvatar")
        }
    }, [state.loggedIn])
    
    // check if token has expired or not on first render

    useEffect(() => {
        if(state.loggedIn){
            const ourRequest = Axios.CancelToken.source()
            async function fetchResults() {
                try{
                    const response = await Axios.post("/checkToken", {token: state.user.token},{cancelToken: ourRequest.token})
                    if (!response.data) {
                        dispatch({type: "logout"})
                        dispatch({type: "flashMessage", value: "Your session has expired. please log in again."})
                    }
                }catch(e){
                    console.log("Thre was a problem or the request was cancelled")
                }
            }
            fetchResults()
        }
    }, [])

    return(
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>
                <BrowserRouter>
                    <FlashMessages messages={state.flashMessages}/>
                    <Header />
                    <Suspense fallback={<LoadingDotsIcons/>}>
                    <Routes>
                        <Route path="/" element={state.loggedIn? <Home/> : <HomeGuest/>} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/create-post" element={<CreatePost/>}/>
                        <Route path="/post/:id" element={<ViewSinglePost/>}/>
                        <Route path="/profile/:username/*" element={<Profile/>}/>
                        <Route path="/post/:id/edit" element={<EditPost/>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>           
                    <CSSTransition timeout={330} in={state.isSearch} classNames="search-overlay" unmountOnExit>
                        <div className="search-overlay">
                            <Suspense fallback="">
                                <Search />
                            </Suspense>
                        </div>
                    </CSSTransition>
                    <Chat />
                    <Footer />          
                </BrowserRouter>
            </DispatchContext.Provider>
        </StateContext.Provider>
    )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if(module.hot) {
    module.hot.accept()
}