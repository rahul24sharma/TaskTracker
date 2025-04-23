import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {  FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { useSelector } from "react-redux"

const Footer = () => {
  
  const { isAuthorized } = useSelector((state) => {
    return state.auth;
  });
  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div>&copy; HireHub</div>
      <div>
        <Link to={"https://github.com/sumanthreddy94/HireHub.git"} target="_blank">
          <FaGithub />
        </Link>
        <Link to={"hhttps://www.linkedin.com/in/"} target="_blank">

          <FaLinkedin />
        </Link>
        <Link to={"https://www.instagram.com/"} target="_blank">
          <RiInstagramFill />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;