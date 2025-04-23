// import { createSlice } from "@reduxjs/toolkit";

// import Cookies from "js-cookie";

// const tokenFromCookie = Cookies.get("token");

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     isAuthorized: !!tokenFromCookie, // Check if a token exists
//     user: null,
//     token: tokenFromCookie || null,
//     role: null,
//   },
//   reducers: {
//     setAuth(state, action) {
//       const { user, token, role } = action.payload;
//       state.isAuthorized = true;
//       state.user = user;
//       state.token = token;
//       state.role = role;
//     },
//     logout(state) {
//       state.isAuthorized = false;
//       state.user = null;
//       state.token = null;
//       state.role = null;
//       Cookies.remove("token"); // Remove token from cookies
//     },
//   },
// });

// export const { setAuth, logout } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const tokenFromCookie = Cookies.get("token");
const roleFromStorage = localStorage.getItem("role");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthorized: !!tokenFromCookie, 
    user: null,
    token: tokenFromCookie || null,
    role: roleFromStorage || null,
  },
  reducers: {
    setAuth(state, action) {
      const { user, token, role } = action.payload;
      state.isAuthorized = true;
      state.user = user;
      state.token = token;
      state.role = role;
      
      // Sync to both cookie and localStorage
      if (token) Cookies.set("token", token);
      if (role) localStorage.setItem("role", role);
    },
    logout(state) {
      state.isAuthorized = false;
      state.user = null;
      state.token = null;
      state.role = null;
      
      // Clear from both cookie and localStorage
      Cookies.remove("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loggedIn");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;