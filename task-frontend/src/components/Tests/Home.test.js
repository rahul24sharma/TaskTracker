import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../Home/Home';
import '@testing-library/jest-dom';

// Mock Redux store
const mockStore = () => configureStore({
  reducer: {
    auth: () => ({
      isAuthorized: true,
      username: 'testuser'
    })
  },
  preloadedState: {
    auth: {
      isAuthorized: true,
      username: 'testuser'
    }
  }
});

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('RBAC Tests', () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'submitter');
    axios.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          creator: 'testuser',
          createdAt: new Date()
        }
      ]
    });
  });

  test('Submitter cannot see approve/reject buttons', async () => {
    render(
      <Provider store={mockStore()}>
        <Home />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });
});

describe('UI Component Tests', () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'submitter');
    axios.get.mockResolvedValue({ data: [] });
  });

  test('Task form shows validation errors', async () => {
    render(
      <Provider store={mockStore()}>
        <Home />
      </Provider>
    );

    fireEvent.click(screen.getByText('Add'));

    // Debug DOM if needed
    // screen.debug();

    await waitFor(() => {
      expect(screen.getByTestId('form-error')).toBeInTheDocument();
    });
  });

  test('Task form submits successfully with valid data', async () => {
    axios.post.mockResolvedValue({
      data: {
        id: 2,
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        creator: 'testuser',
        createdAt: new Date()
      }
    });

    render(
      <Provider store={mockStore()}>
        <Home />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'New Task' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description'), {
      target: { value: 'New Description' }
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks/create',
        {
          title: 'New Task',
          description: 'New Description',
          status: 'pending',
          creator: 'testuser'
        },
        { withCredentials: true }
      );
    });
  });
});
