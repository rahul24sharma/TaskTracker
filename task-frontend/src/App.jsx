import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import  { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import NotFound from "./components/NotFound/NotFound";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { setAuth, logout } from './components/redux/authSlice';
import { useDispatch, useSelector } from "react-redux"
const App = () => {

  const dispatch = useDispatch();
  const isLoggedIn = localStorage.getItem("loggedIn");
  const role = localStorage.getItem("role");

  const { isAuthorized } = useSelector((state) => {
    return state.auth;
  });
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/auth/getuser", {
          withCredentials: true,
        });
        const { user, role } = response.data;
        console.log(response.data)
        if (user) {
          console.log(role)
          dispatch(setAuth({ user, role }));
          window.localStorage.setItem("loggedIn", true)
          if (user && user.name) {
            window.localStorage.setItem("user", user.name);
          } else {
            console.error("User name is not available.");
          }
                  } else {
          dispatch(logout());
          localStorage.removeItem("token")
          localStorage.removeItem("loggedIn")
        }
      } catch (error) {
        console.error("No user is logged In right now!");
        dispatch(logout());
        window.localStorage.setItem("loggedIn", false)
      }
    };

    getUser();
  }, [dispatch, isAuthorized]);



  return (
    <Router>
        <Navbar isLoggedIn={isAuthorized} />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toaster />
    </Router>
  );
};

export default App;
