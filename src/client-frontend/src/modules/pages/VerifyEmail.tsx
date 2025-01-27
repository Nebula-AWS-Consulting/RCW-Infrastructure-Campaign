import * as React from 'react';
import { Field, Form } from 'react-final-form';
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
import { Button } from '@mui/material';
import { selectLanguage } from '../ducks/userSlice';

function VerifyEmail() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const userAccessToken = useSelector((state: RootState) => state.userAuthAndInfo.token.access_token);
  const navigate = useNavigate()
  const language = useSelector(selectLanguage);

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
        const errorData = await response.json();
        throw { 
          message: errorData.message, 
          errorType: errorData.errorType, 
          status: response.status 
        };
      }
  
      await response.json();
      navigate('/auth/created');
    } catch (error: any) {
        const userFriendlyMessages: { [key: string]: string } = {
            CodeMismatch: 'The confirmation code you entered is incorrect. Please try again.',
            ExpiredCode: 'The confirmation code has expired. Please request a new one and try again.',
            NotAuthorized: 'You are not authorized to confirm this email. Please log in and try again.',
            UserNotFound: 'We could not find an account associated with this request. Please verify your details.',
            InternalError: 'An unexpected error occurred. Please try again later.'
        };
    
        const errorType = error.errorType || 'InternalError';
        const message = userFriendlyMessages[errorType] || error.message || 'An unexpected error occurred. Please try again later.';
    
        setSubmitError(message);
  } finally {
      setSent(false);
    }
  };

  const resendCode = async () => {
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
          message: errorData.message, 
          errorType: errorData.errorType, 
          status: response.status 
        };
      }

      await response.json();
    } catch (error: any) {
      const userFriendlyMessages: { [key: string]: string } = {
          LimitExceeded: 'You have reached the maximum number of attempts. Please wait a while before trying again.',
          NotAuthorized: 'You are not authorized to request a new verification code. Please log in and try again.',
          UserNotFound: 'We could not find an account associated with this request. Please verify your details.',
          InternalError: 'An unexpected error occurred. Please try again later.'
      };
      const errorType = error.errorType || 'InternalError';
      const message = userFriendlyMessages[errorType] || error.message || 'An unexpected error occurred. Please try again later.';
  
      setSubmitError(message);
  } finally {
    setSent(false);
  }
  };

  return (
    <React.Fragment>
        <AppForm>
          <React.Fragment>
            <Typography variant="h3" gutterBottom marked="center" align="center">
              {language === 'en-US'? 'Verify your Email' : language === 'fr-FR' ? `Vérifiez votre e-mail` : language === 'es-MX' ? 'Verifica tu correo electrónico' : ''}
            </Typography>
            <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
              {language === 'en-US'? 'We sent you an email with a confirmation code.' 
              : language === 'fr-FR' ? `Nous vous avons envoyé un e-mail avec un code de confirmation.` 
              : language === 'es-MX' ? 'Le enviamos un correo electrónico con un código de confirmación.' 
              : ''}
            </Typography>
            <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
              {language === 'en-US'? 'Enter the confirmation code below' 
              : language === 'fr-FR' ? `Entrez le code de confirmation ci-dessous` 
              : language === 'es-MX' ? 'Ingrese el código de confirmación a continuación' 
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
                  component={RFTextField}
                  disabled={submitting || sent}
                  fullWidth
                  label={language === 'en-US'? 'Confirmation Code' : language === 'fr-FR' ? `Code de Confirmation` : language === 'es-MX' ? 'Código de Confirmación' : ''}
                  margin="normal"
                  name="confirmation_code"
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
                          ? 'Verify Email'
                          : language == 'fr-FR'
                          ? `Vérifier l'e-mail`
                          : language == 'es-MX'
                          ? 'Verificar Correo Electrónico'
                          : ''}
                </FormButton>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '1rem',
                }}>
                    <Button sx={{fontSize: '1rem', p: '1rem', width: '100%'}} onClick={() => resendCode()}>
                    {submitting || sent
                          ? language == 'en-US'
                            ? 'In Progress...'
                            : language == 'fr-FR'
                            ? 'En Cours...'
                            : language == 'es-MX'
                            ? 'En Curso...'
                            : ''
                          : language == 'en-US'
                          ? 'Resend Code'
                          : language == 'fr-FR'
                          ? `Renvoyer le code`
                          : language == 'es-MX'
                          ? 'Reenviar Código'
                          : ''}
                    </Button>
                </Box>
              </Box>
            )}
          </Form>
        </AppForm>
    </React.Fragment>
  );
}

export default withRoot(VerifyEmail);