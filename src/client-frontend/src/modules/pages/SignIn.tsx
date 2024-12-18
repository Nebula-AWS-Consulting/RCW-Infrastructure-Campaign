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
import { selectLanguage, setLogin } from '../ducks/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../App';

function SignIn() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const language = useSelector(selectLanguage);

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
    setSubmitError('');
  
    try {
      const response = await fetch(
        `${SERVER}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password
          }),
        }
      );
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
    
      const data = await response.json();
    
      const userName = await getUserUsername(values.email);
    
      const userData = {
        user_name: userName,
        email: values.email
      };
    
      const tokenData = {
        user_id: data.user_id,
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

      navigate('/');
    } catch(error: any) {
        try {
          if (error.message === 'Incorrect username or password') {
            setSubmitError('The password you entered is incorrect.');
          } else if (error.message === 'User not found') {
            setSubmitError('No account found with this email address.');
          } else {
            setSubmitError(error.message || 'Sign-in failed. Please try again.');
          }
        } catch (parseError) {
          setSubmitError('An unexpected error occurred. Please try again.');
        }
    } finally {
      setSent(false);
    }
  };

const getUserUsername = async (email:string) => {
  const response = await fetch(
    `${SERVER}/user?email=${encodeURIComponent(email)}`,
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
          {language === 'en-US'? 'Sign In' : language === 'fr-FR' ? 'Se Connecter' : language === 'es-MX' ? 'Iniciar Sesión' : ''}
          </Typography>
          <Typography variant="body2" align="center">
            {language === 'en-US'? 'Not a member yet? ' : language === 'fr-FR' ? 'Pas encore membre ? ' : language === 'es-MX' ? '¿Aún no eres miembro? ' : ''}
            <Link
              href="/auth/signup"
              align="center"
              underline="always"
            >
              {language === 'en-US'? 'Sign Up Here' : language === 'fr-FR' ? 'Inscrivez-vous ici' : language === 'es-MX' ? 'Regístrate aquí' : ''}
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
                label={language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
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
                label={language === 'en-US'? 'Password' : language === 'fr-FR' ? 'Mot de Passe' : language === 'es-MX' ? 'Contraseña' : ''}
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
                {submitting || sent
                          ? language == 'en-US'
                            ? 'In Progress...'
                            : language == 'fr-FR'
                            ? 'En Cours...'
                            : language == 'es-MX'
                            ? 'En Curso...'
                            : ''
                          : language == 'en-US'
                          ? 'Sign In'
                          : language == 'fr-FR'
                          ? 'Se Connecter'
                          : language == 'es-MX'
                          ? 'Iniciar Sesión'
                          : ''}
              </FormButton>
            </Box>
          )}
        </Form>
        <Typography align="center">
          <Link underline="always" href="/auth/forgotpassword">
            {language === 'en-US'? 'Forgot password?' : language === 'fr-FR' ? 'Mot de passe oublié ?' : language === 'es-MX' ? '¿Has olvidado tu contraseña?' : ''}
          </Link>
        </Typography>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(SignIn);
