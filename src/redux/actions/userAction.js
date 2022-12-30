import apiClient from "../../api/apiClient";
import {
  LOGIN_REQUEST,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_PASSWORD_SUCCESS,
  UPDATE_PASSWORD_FAIL,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  ALL_USERS_REQUEST,
  ALL_USERS_SUCCESS,
  ALL_USERS_FAIL,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  CLEAR_ERRORS,
} from "../constants/userConstants";
import axios from "axios";

// Login
export const login = (email, password) => async (dispatch) => {
  if (!dispatch) {
    console.log('dispatch is undefined');
    return;
  }

  if (!email) {
    dispatch({
      type: LOGIN_FAIL,
      payload: 'Email is required',
    });
    return;
  }

  if (!password) {
    dispatch({
      type: LOGIN_FAIL,
      payload: 'Password is required',
    });
    return;
  }

  dispatch({ type: LOGIN_REQUEST });

  try {
    const response = await apiClient.post('/login', { email, password });

    if (response.status === 200) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("expiresAt", response.expiresAt);

      const userData = {
        user: response.result,
        token: response.token,
        expiresAt: response.expiresAt,
      };

      dispatch({
        type: LOGIN_SUCCESS,
        payload: userData,
      });
    }
    else {
      dispatch({
        type: LOGIN_FAIL,
        payload: response.message || 'An error occurred while logging in',
      });
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: error.message || error,
    });
  }
};

// Register
export const register = (userData) => async (dispatch) => {
  if (!dispatch) {
    console.log('dispatch is undefined');
    return;
  }

  if (!userData) {
    dispatch({
      type: REGISTER_USER_FAIL,
      payload: 'User data is required',
    });
    return;
  }

  dispatch({ type: REGISTER_USER_REQUEST });

  try {
    const response = await apiClient.post('/register', userData);

    if (response.status === 200 || response.status === 201) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("expiresAt", response.expiresAt);

      const userDataLocal = {
        user: response.result,
        token: response.token,
        expiresAt: response.expiresAt,
      };

      dispatch({
        type: REGISTER_USER_SUCCESS,
        payload: userDataLocal,
      });
    }
    else {
      dispatch({
        type: REGISTER_USER_FAIL,
        payload: response.message || 'An error occurred while registering',
      });
    }
  } catch (error) {
    dispatch({
      type: REGISTER_USER_FAIL,
      payload: error.message || error,
    });
  }
};

// Load User
export const loadUser = (token) => async (dispatch) => {
  if (!dispatch) {
    console.log('dispatch is undefined');
    return;
  }

  if (!token) {
    dispatch({
      type: LOAD_USER_FAIL,
      payload: 'Token is required',
    });
    return;
  }

  dispatch({ type: LOAD_USER_REQUEST });

  try {
    const options = {};

    options.headers = { 'Authorization': `Bearer ${token}` };

    const response = await apiClient.get('/user/me', options);

    if (response.status === 200) {
      if (
        response.result.token &&
        response.result.token === token &&
        response.result.expiresAt > new Date().getTime() / 1000
      ) {
        const userData = {
          user: response.result,
          token: response.result.token,
          expiresAt: response.result.expiresAt,
        };

        dispatch({
          type: LOAD_USER_SUCCESS,
          payload: userData,
        });
      } else {
        dispatch(logout());
        dispatch({
          type: LOAD_USER_FAIL,
          payload: "Token is invalid or expired.",
        });
      }
    }
    else {
      dispatch(logout());
      dispatch({
        type: LOAD_USER_FAIL,
        payload: response.message || 'An error occurred while loading user',
      });
    }
  } catch (error) {
    dispatch(logout());
    dispatch({
      type: LOAD_USER_FAIL,
      payload: error.message || error,
    });
  }
};

// Logout User
export const logout = () => async (dispatch) => {
  if (!dispatch) {
    console.log('dispatch is undefined');
    return;
  }

  try {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");

    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    dispatch({
      type: LOGOUT_FAIL,
      payload: "An error occurred while logging out",
    });
  }
};

// Update Profile
export const updateProfile = (userData, token) => async (dispatch) => {
  if (!dispatch) {
    console.log('dispatch is undefined');
    return;
  }

  if (!userData) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: 'User data is required',
    });
    return;
  }

  if (!token) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: 'Token is required',
    });
    return;
  }

  dispatch({ type: UPDATE_PROFILE_REQUEST });

  try {
    const options = {};

    options.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };

    const response = await apiClient.put('/user/me/update', userData, options);

    if (response.status === 200) {
      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: response.success,
      });
    }
    else {
      dispatch({
        type: UPDATE_PROFILE_FAIL,
        payload: response.message || 'An error occurred while updating profile',
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: error.message || error,
    });
  }
};

// Update Password
export const updatePassword = (passwords, token) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_PASSWORD_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(
      `/api/v1/password/update`,
      passwords,
      config
    );

    dispatch({
      type: UPDATE_PASSWORD_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_PASSWORD_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Forgot Password
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: FORGOT_PASSWORD_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(`/api/v1/password/forgot`, email, config);

    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Reset Password
export const resetPassword = (token, passwords) => async (dispatch) => {
  try {
    dispatch({ type: RESET_PASSWORD_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(
      `/api/v1/password/reset/${token}`,
      passwords,
      config
    );

    dispatch({
      type: RESET_PASSWORD_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAIL,
      payload: error.response.data.message,
    });
  }
};

// get All Users
export const getAllUsers = (token) => async (dispatch) => {
  try {
    dispatch({ type: ALL_USERS_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(`/api/v1/admin/users`, config);
    console.log(data);

    dispatch({
      type: ALL_USERS_SUCCESS,
      payload: data.results,
    });
  } catch (error) {
    dispatch({
      type: ALL_USERS_FAIL,
      payload: error.response.data.message,
    });
  }
};

// get  User Details
export const getUserDetails = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(`/api/v1/admin/user/${id}`, config);

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data.result,
    });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Update User
export const updateUser = (id, userData, token) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.put(
      `/api/v1/admin/user/${id}`,
      userData,
      config
    );

    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: data.success,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Delete User
export const deleteUser = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_USER_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.delete(`/api/v1/admin/user/${id}`, config);

    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: error.response.data.message,
    });
  }
};

// Clearing Errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
