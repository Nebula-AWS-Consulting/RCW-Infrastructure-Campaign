import * as React from 'react';
import { Field, Form } from 'react-final-form';
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
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function ForgotPassword() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const navigate = useNavigate()
  const language = useSelector(selectLanguage);

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
          throw { 
            message: errorData.message, 
            errorType: errorData.errorType, 
            status: response.status 
          };
        }
    
        
        await response.json();
        navigate('/auth/confirmpassword')
      } catch (error: any) {
          const userFriendlyMessages: { [key: string]: string } = {
            UserNotFound: 'We could not find an account associated with this email address. Please check your details.',
            LimitExceeded: 'You have reached the maximum number of attempts. Please wait a while before trying again.',
            NotAuthorized: 'You are not authorized to reset the password for this account. Please contact support.',
            InternalError: 'An unexpected error occurred. Please try again later.',
          };
      
          const errorType = error.errorType || 'InternalError';
          const message =
            userFriendlyMessages[errorType] || error.message || 'An unexpected error occurred. Please try again later.';
      
          setSubmitError(message);
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
              {language === 'en-US'? 'Forgot your password?' : language === 'fr-FR' ? `Vous avez oublié votre mot de Passe ?` : language === 'es-MX' ? '¿Olvidaste tu Contraseña?' : ''}
            </Typography>
            <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
              {language === 'en-US'? `Enter your email address below and we'll send you a link to reset your password.` 
              : language === 'fr-FR' ? `Entrez votre adresse e-mail ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.` 
              : language === 'es-MX' ? 'Ingrese su dirección de correo electrónico a continuación y le enviaremos un enlace para restablecer su contraseña.' 
              : ''}
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
                  label={language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
                  margin="normal"
                  name="email"
                  required
                  size="large"
                />
                {submitError && (
                      <FormFeedback error sx={{ mt: 2 }}>
                        {submitError}
                      </FormFeedback>
                    )}
                <FormButton
                  type="submit"
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
                          ? 'Send Reset Link'
                          : language == 'fr-FR'
                          ? 'Envoyer le lien de Réinitialisation'
                          : language == 'es-MX'
                          ? 'Enviar enlace de Reinicio'
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

export default withRoot(ForgotPassword);
