import React from 'react'
import AppAppBar from '../views/AppAppBar'
import AppFooter from '../views/AppFooter'
import AppForm from '../views/AppForm'
import { Field, Form, FormSpy } from 'react-final-form'
import { Box } from '@mui/material'
import FormButton from '../form/FormButton'
import Typography from '../components/Typography'
import { useNavigate } from 'react-router-dom'
import { email, required } from '../form/validation'
import RFTextField from '../form/RFTextField'
import FormFeedback from '../form/FormFeedback'
import { SERVER } from '../../App'

function ConfirmNewPassword() {
  const [sent, setSent] = React.useState(false);
  const navigate = useNavigate()

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['email', 'confirmation_code', 'new_password'], values);

    if (!errors.email) {
      const emailError = email(values.email);
      if (emailError) {
        errors.email = emailError;
      }
    }

    return errors;
  };

    const handleSubmit = async (values: { [index: string]: string }) => {
        setSent(true);
          try {
            const response = await fetch(
              `${SERVER}/confirm-forgot-password`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: values.email,
                  confirmation_code: values.confirmation_code,
                  new_password: values.new_password
                })
              }
            );
        
            if (!response.ok) {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.statusText}`);
                }
            }
        
            await response.json();
            navigate('/auth/signin')
          } catch (error: any) {
            if (error.message === 'Invalid confirmation code') {
                throw new Error('The confirmation code you entered is invalid. Please check and try again.');
              } else if (error.message === 'Confirmation code expired') {
                throw new Error('The confirmation code has expired. Please request a new code.');
              } else if (error.message === 'User not found') {
                throw new Error('No account found with the provided email address.');
              } else if (error.message === 'Attempt limit exceeded, please try again later') {
                throw new Error('You have exceeded the maximum number of attempts. Please wait and try again later.');
              } else if (error.message.includes('Password')) {
                throw new Error('Your new password does not meet the requirements. Please ensure it is strong and try again.');
              } else {
                throw new Error(error.message || 'An unexpected error occurred. Please try again.');
              }
          } finally {
            setSent(false);
          }
      }

  return (
    <React.Fragment>
        <AppAppBar />
            <AppForm>
                <React.Fragment>
                <Typography variant="h3" gutterBottom marked="center" align="center">
                    Confirm Password
                </Typography>
                <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
                    {"Enter your email address below and we'll " +
                    'send you a link to reset your password.'}
                </Typography>
                </React.Fragment>
                <Form
                onSubmit={handleSubmit}
                subscription={{ submitting: true }}
                validate={validate}
                >
                {({ handleSubmit: handleSubmit2, submitting }) => (
                    <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
                    <Field
                        autoFocus
                        autoComplete="email"
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        label="Email"
                        margin="normal"
                        name="email"
                        required
                        size="large"
                    />
                    <Field
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        label="Confirmation Code"
                        margin="normal"
                        name="confirmation_code"
                        required
                        size="large"
                    />
                    <Field
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        label="New Password"
                        margin="normal"
                        name="new_password"
                        required
                        size="large"
                    />
                    <FormSpy subscription={{ submitError: true }}>
                        {({ submitError }) =>
                        submitError ? (
                            <FormFeedback error sx={{ mt: 2 }}>
                            {submitError}
                            </FormFeedback>
                        ) : null
                        }
                    </FormSpy>
                    <FormButton
                        type="submit"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={submitting || sent}
                        size="large"
                        color="secondary"
                        fullWidth
                    >
                        {submitting || sent ? 'In progress…' : 'Set new passowrd'}
                    </FormButton>
                    </Box>
                )}
                </Form>
            </AppForm> 
        <AppFooter />
    </React.Fragment>
  )
}

export default ConfirmNewPassword