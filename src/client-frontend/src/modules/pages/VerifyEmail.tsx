import * as React from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import Box from '@mui/material/Box';
import Typography from '../components/Typography';
import AppForm from '../views/AppForm';
import RFTextField from '../form/RFTextField';
import FormButton from '../form/FormButton';
import FormFeedback from '../form/FormFeedback';
import withRoot from '../withRoot';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { confirmationCode, required } from '../form/validation';
import { SERVER } from '../../App';

function VerifyEmail() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const userAccessToken = useSelector((state: RootState) => state.userAuthAndInfo.token.access_token);
  const navigate = useNavigate()

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['confirmation_code'], values);

    if (!errors.confirmation_code) {
      const codeError = confirmationCode(values.confirmation_code);
      if (codeError) {
        errors.confirmation_code = codeError;
      }
    }

    return errors;
  };

  const handleSubmit = async (values: { [index: string]: string }) => {
    setSent(true);
    setSubmitError('');
  
    try {
      const response = await fetch(
        `${SERVER}/confirm-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: userAccessToken,
            confirmation_code: values.confirmation_code,
          }),
        }
      );
  
      if (!response.ok) {
        // Parse the error message from the response
        const errorData = await response.json();
        if (errorData.message === 'User not found') {
          throw new Error('No account exists with the provided email.');
        } else if (errorData.message === 'Not authorized to confirm user') {
          throw new Error('You are not authorized to confirm this user.');
        } else {
          throw new Error(errorData.message || 'An unexpected error occurred.');
        }
      }
  
      await response.json();
      navigate('/auth/created');
    } catch (error: any) {
      setSubmitError(error.message || 'Confirmation failed. Please try again.');
    } finally {
      setSent(false);
    }
  };
  

  return (
    <React.Fragment>
        <AppForm>
          <React.Fragment>
            <Typography variant="h3" gutterBottom marked="center" align="center">
              Verify your Email
            </Typography>
            <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
              {"We sent you an email with a confirmation code " +
                'Enter the confirmation code below'}
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
                  component={RFTextField}
                  disabled={submitting || sent}
                  fullWidth
                  label="Confirmation Code"
                  margin="normal"
                  name="confirmation_code"
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
                  {submitting || sent ? 'In progress…' : 'Verify Email'}
                </FormButton>
              </Box>
            )}
          </Form>
        </AppForm>
    </React.Fragment>
  );
}

export default withRoot(VerifyEmail);