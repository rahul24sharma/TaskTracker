import express from 'express';
import { createTask, getTasks, updateTaskStatus, markTaskAsDone, deleteTask, getAllTasks, editOwnPendingTask } from '../controllers/taskController.js';
import { isAuthorised } from '../middleware/auth.js';
const router = express.Router();

router.get('/alltasks', getAllTasks);

router.post('/tasks/create', isAuthorised, createTask);

router.get('/tasks', isAuthorised, getTasks);

router.put('/tasks/:taskId/status', isAuthorised, updateTaskStatus);

router.put('/tasks/:taskId/done', isAuthorised, markTaskAsDone);

router.delete('/tasks/:taskId', isAuthorised, deleteTask);

router.put('/tasks/:taskId', isAuthorised, editOwnPendingTask);


export default router;
