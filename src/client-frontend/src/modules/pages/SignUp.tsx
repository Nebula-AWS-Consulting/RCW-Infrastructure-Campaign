import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { Field, Form } from 'react-final-form';
import Typography from '../components/Typography';
import AppFooter from '../views/AppFooter';
import AppAppBar from '../views/AppAppBar';
import AppForm from '../views/AppForm';
import { email, password, required } from '../form/validation';
import RFTextField from '../form/RFTextField';
import FormButton from '../form/FormButton';
import FormFeedback from '../form/FormFeedback';
import withRoot from '../withRoot';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectLanguage, setLogin } from '../ducks/userSlice';
import { SERVER } from '../../App';

function SignUp() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const navigate = useNavigate()
  const dispatch = useDispatch()
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
        `${SERVER}/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            password: values.password
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw { 
          message: errorData.message
        };
      }
  
      await response.json();
  
      const userName = `${values.firstName} ${values.lastName}`;
  
      confirmUser(values.email);
      const accessToken = await loginUser(values.email, values.password, userName);
      sendCode(accessToken)
      
      navigate('/auth/verify')
    } catch (error: any) {
        const message = error.message || 'An unexpected error occurred. Please try again later.';
        setSubmitError(message);
    } finally {
      setSent(false);
    }
  };

  const confirmUser = async (email: string) => {
    try {
      const response = await fetch(
          `${SERVER}/confirm`,
          {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email
            })
            }
        )
    
        if (!response.ok) {
          const errorData = await response.json();
          throw { 
            message: errorData.message
          };
        }

        await response.json();
      } catch (error: any) {
    } finally {
      setSent(false);
    }
  };

  const sendCode = async (userAccessToken: string | null) => {
    if (!userAccessToken) {
      setSubmitError('Unable to send verification code. User is not logged in.');
      return;
    }

    try {
      const response = await fetch(
        `${SERVER}/confirm-email-resend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: userAccessToken,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData.message
        };
      }

      await response.json();
    } catch (error: any) {
      const message = error.message || 'An unexpected error occurred. Please try again later.';
      setSubmitError(message);
  } finally {
    setSent(false);
  }
  };

  const loginUser = async (email: string, password: string, user_name: string) => {
    try {
      const response = await fetch(`${SERVER}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData.message
        };
      }

      const data = await response.json();

      const userData = {
        user_name: user_name,
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

      return data.access_token;
    } catch (error: any) {
      const message = error.message || 'An unexpected error occurred. Please try again later.';
      setSubmitError(message);
    } finally {
      setSent(false);
    }
  };

  return (
    <React.Fragment>
      <AppAppBar />
      <AppForm>
        <React.Fragment>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            {language === 'en-US'? 'Sign Up' : language === 'fr-FR' ? `S'inscrire` : language === 'es-MX' ? 'Inscribirse' : ''}
          </Typography>
          <Typography variant="body2" align="center">
            <Link href="/auth/signin" underline="always">
              {language === 'en-US'? 'Already have an account?' : language === 'fr-FR' ? `Vous avez déjà un compte ?` : language === 'es-MX' ? '¿Ya tienes una cuenta?' : ''}
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    autoFocus
                    component={RFTextField}
                    disabled={submitting || sent}
                    autoComplete="given-name"
                    fullWidth
                    label={ language === 'en-US'? 'First Name' : language === 'fr-FR' ? 'Prénom' : language === 'es-MX' ? 'Nombre de Pila' : ''}
                    name="firstName"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    component={RFTextField}
                    disabled={submitting || sent}
                    autoComplete="family-name"
                    fullWidth
                    label={ language === 'en-US'? 'Last Name' : language === 'fr-FR' ? 'Nom de Famille' : language === 'es-MX' ? 'Apellido' : ''}
                    name="lastName"
                    required
                  />
                </Grid>
              </Grid>
              <Field
                autoComplete="email"
                component={RFTextField}
                disabled={submitting || sent}
                fullWidth
                label={language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
                margin="normal"
                name="email"
                required
              />
              <Field
                fullWidth
                component={RFTextField}
                disabled={submitting || sent}
                required
                name="password"
                autoComplete="new-password"
                label={language === 'en-US'? 'Password' : language === 'fr-FR' ? 'Mot de Passe' : language === 'es-MX' ? 'Contraseña' : ''}
                type="password"
                margin="normal"
              />
              {submitError && (
                <FormFeedback error sx={{ mt: 2 }}>
                  {submitError}
                </FormFeedback>
              )}
              <FormButton
                sx={{ mt: 3, mb: 2 }}
                disabled={submitting || sent}
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
                          ? 'Sign Up'
                          : language == 'fr-FR'
                          ? `S'inscrire`
                          : language == 'es-MX'
                          ? 'Inscribirse'
                          : ''}
              </FormButton>
            </Box>
          )}
        </Form>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(SignUp);
