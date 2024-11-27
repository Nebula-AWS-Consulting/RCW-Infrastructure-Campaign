import * as React from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '../components/Typography';
import AppFooter from '../views/AppFooter';
import AppAppBar from '../views/AppAppBar';
import AppForm from '../views/AppForm';
import { email, password, required } from '../form/validation';
import RFTextField from '../form/RFTextField';
import FormButton from '../form/FormButton';
import FormFeedback from '../form/FormFeedback';
import withRoot from '../withRoot';
import { setLogin } from '../ducks/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  const handleSubmit = async (values: { [index: string]: string }) => {
    setSent(true);
    try {
      await loginUser(values.email, values.password);
      navigate('/');
    } catch (error) {
      setSubmitError('Sign-in failed. Please try again.');
    } finally {
      setSent(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    const response = await fetch(
      `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  
    const data = await response.json();
  
    const userName = await getUserUsername(email);
  
    const userData = {
      user_name: userName,
      email: email,
    };
  
    const tokenData = {
      id_token: data.id_token,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userToken', JSON.stringify(tokenData));
  
    dispatch(
      setLogin({
        user: userData,
        token: tokenData,
      })
    );
  };

  const getUserUsername = async (email:string) => {
    const response = await fetch(
      `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/user?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();

    const userName = `${data.user_attributes['custom:firstName']} ${data.user_attributes['custom:lastName']}`;

    return userName
  }

  return (
    <React.Fragment>
      <AppAppBar />
      <AppForm>
        <React.Fragment>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            Sign In
          </Typography>
          <Typography variant="body2" align="center">
            {'Not a member yet? '}
            <Link
              href="/auth/signup"
              align="center"
              underline="always"
            >
              Sign Up here
            </Link>
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
                autoComplete="email"
                autoFocus
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
                fullWidth
                size="large"
                component={RFTextField}
                disabled={submitting || sent}
                required
                name="password"
                autoComplete="current-password"
                label="Password"
                type="password"
                margin="normal"
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
              {submitError && (
                <FormFeedback error sx={{ mt: 2 }}>
                  {submitError}
                </FormFeedback>
              )}
              <FormButton
                sx={{ mt: 3, mb: 2 }}
                disabled={submitting || sent}
                size="large"
                color="secondary"
                fullWidth
              >
                {submitting || sent ? 'In progress…' : 'Sign In'}
              </FormButton>
            </Box>
          )}
        </Form>
        <Typography align="center">
          <Link underline="always" href="/forgotpassword">
            Forgot password?
          </Link>
        </Typography>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(SignIn);
