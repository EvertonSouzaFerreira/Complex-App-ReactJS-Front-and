import React, {useState, useEffect, useContext } from "react"
import HeaderLogOut from "./HeaderLogOut"
import HeaderLogIn from "./HeaderLogIn"
import StateContext from '../StateContext'


function Header(props) {
    const appState = useContext(StateContext)
    const headerContent = appState.loggedIn ? <HeaderLogIn  /> : <HeaderLogOut />

  return (
    <>
      <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <a href="/" className="text-white">
            ComplexApp
          </a>
        </h4>
        {!props.staticEmpty ? headerContent : ""}
      </div>
    </header>
    </>
  )
}

export default Header