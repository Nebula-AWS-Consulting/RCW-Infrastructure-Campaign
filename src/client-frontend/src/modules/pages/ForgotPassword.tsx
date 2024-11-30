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
import { SERVER } from '../../App';

function ForgotPassword() {
  const [sent, setSent] = React.useState(false);
  const navigate = useNavigate()

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['email'], values);

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
          `${SERVER}/forgot-password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: values.email
            })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
    
        
        await response.json();
        navigate('/auth/confirmpassword')
      } catch (error: any) {
        if (error.message === 'User not found') {
          throw new Error('No account exists with the provided email address.');
        } else if (error.message === 'Attempt limit exceeded, please try again later') {
          throw new Error('You have exceeded the maximum number of attempts. Please wait and try again later.');
        } else {
          throw new Error(error.message || 'Forgot password failed. Please try again.');
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
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(ForgotPassword);
