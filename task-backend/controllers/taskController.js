import Task from '../models/taskModel.js';  
import User from '../models/userModel.js';  
import { catchAsyncError } from "../middleware/catchAsyncError.js";

export const createTask = catchAsyncError(async (req, res) => {
  const { title, description } = req.body;
  const { id: createdBy, role } = req.user; 

  if (role !== 'submitter') {
    return res.status(403).json({ message: 'Only submitters can create tasks.' });
  }

  try {
    const task = await Task.create({
      title,
      description,
      status: 'pending',  
      createdBy
    });
    const createdTask = await Task.findOne({
      where: { id: task.id },
      include: {
        model: User,
        attributes: ['name']
      }
    });
    
    res.status(201).json(createdTask)
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

export const getTasks = catchAsyncError(async (req, res) => {
  const { role, id } = req.user;
  const { status } = req.query;

  const whereClause = role === 'approver' ? {} : { createdBy: id };
  if (status) {
    whereClause.status = status;
  }

  try {
    const tasks = await Task.findAll({ where: whereClause });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving tasks', error: err.message });
  }
});


export const updateTaskStatus = catchAsyncError(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { role } = req.user;

  if (role !== 'approver') {
    return res.status(403).json({ message: 'Only approvers can update task status.' });
  }

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task status', error: err.message });
  }
});

export const markTaskAsDone = catchAsyncError(async (req, res) => {
  const { taskId } = req.params;
  const { role } = req.user;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (role !== 'approver' && role !== 'submitter') {
    return res.status(403).json({ message: 'You are not authorized to mark this task as done.' });
  }

  if (task.status !== 'approved') {
    return res.status(400).json({ message: 'Task must be approved before marking it as done.' });
  }

  try {
    task.status = 'done';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error marking task as done', error: err.message });
  }
});

export const deleteTask = catchAsyncError(async (req, res) => {
  const { taskId } = req.params;
  const { id: userId, role } = req.user;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (role === 'submitter' && task.createdBy !== userId) {
    return res.status(403).json({ message: 'You can only delete your own tasks.' });
  }

  try {
    await task.destroy();
    res.status(204).send();  
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

export const getAllTasks = catchAsyncError(async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: {
        model: User,
        attributes: ['name']
      },
      attributes: ['id', 'title', 'description', 'status', 'createdAt']
    });
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving all tasks', error: err.message });
  }
});

export const editOwnPendingTask = catchAsyncError(async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;
  const { id: userId, role } = req.user;

  const task = await Task.findByPk(taskId);
  if (!task || task.createdBy !== userId || task.status !== 'pending') {
    return res.status(403).json({ message: 'You can only edit your own pending tasks.' });
  }

  task.title = title || task.title;
  task.description = description || task.description;
  await task.save();
  res.json(task);
});


export default {
  createTask,
  getTasks,
  updateTaskStatus,
  markTaskAsDone,
  deleteTask,
  getAllTasks,
  editOwnPendingTask
};