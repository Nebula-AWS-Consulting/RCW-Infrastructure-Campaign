import * as React from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import Box from '@mui/material/Box';
import Typography from '../components/Typography';
import AppFooter from '../views/AppFooter';
import AppAppBar from '../views/AppAppBar';
import AppForm from '../views/AppForm';
import { email, required } from '../form/validation';
import RFTextField from '../form/RFTextField';
import FormButton from '../form/FormButton';
import FormFeedback from '../form/FormFeedback';
import withRoot from '../withRoot';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [sent, setSent] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
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
    
    if (confirm) {
      await confirmPassword(values.email, values.confirmation_code, values.new_password)
    } else {
      await forgotPassword(values.email)
    }
  }
  
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(
        `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      await response.json();
      setSent(false)
      setConfirm(true)
    } catch (error) {
      throw error;
    }
  }

  const confirmPassword = async (email: string, confirmationCode: string, newPassword: string) => {
    try {
      const response = await fetch(
        `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/confirm-forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            confirmationCode,
            newPassword
          })
        }
      );
  
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
  
      await response.json();
      setSent(false)
      navigate('/auth/signin')
    } catch (error) {
      throw error;
    }
  }

  return (
    <React.Fragment>
      <AppAppBar />
      {confirm ? (
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
      ) : (
      <AppForm>
        <React.Fragment>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Forgot your password?
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
                {submitting || sent ? 'In progress…' : 'Send reset link'}
              </FormButton>
            </Box>
          )}
        </Form>
      </AppForm>
      )
    }
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(ForgotPassword);
