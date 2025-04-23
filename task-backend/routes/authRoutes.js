// const express = require('express');
import express from "express";
const router = express.Router();
import { signup, login, logout, getUser } from '../controllers/authController.js';
import { isAuthorised } from "../middleware/auth.js"


router.post('/signup', signup);
router.post('/login', login);
router.get("/logout", isAuthorised ,logout)
router.get("/getuser", isAuthorised ,getUser)

export default router;
