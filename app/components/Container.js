import React, { useEffect } from "react"

function Container(props) {
  return (
    <>
      <div className={"container py-md-5 " + (props.large ? '' : 'container--narrow')}>
        {props.children}
      </div>
    </>
  )
}

export default Container