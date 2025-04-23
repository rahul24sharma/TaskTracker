import React from 'react'


import { Link } from "react-router-dom";


const Sidebar = ({handleChange, handleClick}) => {

  return (
<div className="space-y-5">
  <h2 className="text-2xl font-extrabold">Task Tracker App</h2>
  <p className="text-primary/75 text-base mb-4">
    The Task Tracker lets submitters create and monitor their own tasks while
    approvers review, approve, or reject them in real time. It keeps every item
    moving smoothly from “pending” to “done,” so your team always knows who’s
    doing what — and what’s next.
  </p>

</div>

  )
}

export default Sidebar
