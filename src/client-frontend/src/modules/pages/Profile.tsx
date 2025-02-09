import React, { useEffect } from 'react'
import AppAppBar from '../views/AppAppBar'
import AppFooter from '../views/AppFooter'
import withRoot from '../withRoot'
import Box from '@mui/material/Box'
import Typography from '../components/Typography'
import Button from '../components/Button'
import { useState } from 'react';
import { SERVER } from '../../App.tsx'
import { useSelector } from 'react-redux'
import { RootState } from '../../store.ts'
import { email, password, required } from '../form/validation.ts'
import AppForm from '../views/AppForm.tsx'

type UserAttribute = 'name' | 'email' | 'password';

const ATTRIBUTE_MAP: Record<UserAttribute, string> = {
  name: 'custom:fullName',
  email: 'email',
  password: 'password',
};

function Profile() {
  const userEmail = useSelector((state: RootState) => state.userAuthAndInfo.user?.email);
  const [userAttributes, setUserAttributes] = useState<{ [key: string]: string } | null>(null);
  const [submitError, setSubmitError] = React.useState(String);
  const [success, setSuccess] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['email', 'password'], values);
    
    if (!errors.email) {
      const emailError = email(values.email);
      if (emailError) {
        errors.email = emailError;
      }
    }
    
    const passwordError = password(values.password);
    if (passwordError) {
      errors.password = passwordError;
    }
    
    return errors;
  };
  
  const updateUserAttribute = async (attributeName: string, attributeValue: string) => {
    const cognitoAttribute = ATTRIBUTE_MAP[attributeName as UserAttribute];
  
    if (!cognitoAttribute) {
      console.error(`Invalid attribute name: ${attributeName}`);
      return;
    }
    setSubmitError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${SERVER}/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          attribute_updates: {
            [cognitoAttribute]: attributeValue,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData.message,
          errorType: errorData.errorType,
          status: response.status,
        };
      }

      const data = await response.json();
      setSuccess(data.message);
    } catch (err: any) {
      const userFriendlyMessages: { [key: string]: string } = {
        UserNotFound: 'No user was found with the provided email address.',
        InvalidParameter: 'One or more fields are invalid. Please check and try again.',
        NotAuthorized: 'You are not authorized to update this user’s attributes.',
        InternalError: 'An unexpected error occurred. Please try again later.',
      };

      const errorType = err.errorType || 'InternalError';
      const message =
        userFriendlyMessages[errorType] || err.message || 'An unexpected error occurred. Please try again later.';

      setSubmitError(message);
    }
  };

  const fetchUserAttributes = async (email: string) => {
    try {
      const response = await fetch(`${SERVER}/user?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData.message,
          errorType: errorData.errorType,
          status: response.status,
        };
      }

      const data = await response.json();
      return data.user_attributes;
    } catch (error: any) {
      const userFriendlyMessages: { [key: string]: string } = {
        UserNotFound: 'No user was found with this email. Please check and try again.',
        InvalidParameter: 'The provided email format is incorrect. Please verify your input.',
        TooManyRequests: 'You have made too many requests. Please wait a while before trying again.',
        InternalServerError: 'An unexpected error occurred. Please try again later.',
      };

      const errorType = error.errorType || 'InternalServerError';
      const message =
        userFriendlyMessages[errorType] || error.message || 'An unexpected error occurred. Please try again later.';

      console.error('Error fetching user attributes:', error);
      throw new Error(message);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserAttributes(userEmail)
        .then(setUserAttributes)
        .catch((err) => setSubmitError(err.message));
    }
  }, [userEmail]);

  const handleNameUpdate = () => {
    if (!newName.trim()) {
      setSubmitError('Name cannot be empty');
      return;
    }
    updateUserAttribute('name', newName);
  };

  const handleEmailUpdate = () => {
    if (!newEmail.trim()) {
      setSubmitError('Email cannot be empty');
      return;
    }
    updateUserAttribute('email', newEmail);
  };

  const handlePasswordUpdate = () => {
    if (!newPassword.trim()) {
      setSubmitError('Password cannot be empty');
      return;
    }
    updateUserAttribute('password', newPassword);
  };

  return (
    <React.Fragment>
      <AppAppBar />
      <AppForm>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: '2rem',
        }}>
          <Typography variant="h4" marked="center" align="center" sx={{ marginBottom: '40px' }}>
            Profile Info
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <Typography>{userAttributes?.["custom:firstName"]} {userAttributes?.["custom:lastName"]}</Typography>
            <Button onClick={handleNameUpdate}>Change Name</Button>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <Typography>{userAttributes?.email}</Typography>
            <Button onClick={handleEmailUpdate}>Change Email</Button>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <Typography>********</Typography>
            <Button onClick={handlePasswordUpdate}>Change Password</Button>
          </Box>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          Cange paypal subscription
        </Box>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  )
}

export default withRoot(Profile)