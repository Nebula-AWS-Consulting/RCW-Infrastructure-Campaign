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
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
  
      await response.json();
      navigate('/auth/created');
    } catch (error: any) {
        if (error.message === 'Invalid confirmation code') {
            setSubmitError('The confirmation code you entered is incorrect. Please check and try again.');
          } else if (error.message === 'Confirmation code expired') {
            setSubmitError('The confirmation code has expired. Please request a new one.');
          } else if (error.message === 'Not authorized') {
            setSubmitError('You are not authorized to verify this email. Please log in and try again.');
          } else if (error.message === 'User not found') {
            setSubmitError('We could not find an account associated with this email. Please check and try again.');
          } else {
            setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
          }
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
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      await response.json();
    } catch (error: any) {
        if (error.message === 'Attempt limit exceeded, please try again later') {
            throw new Error('You have exceeded the maximum number of attempts. Please wait and try again later.');
          } else if (error.message === 'Not authorized') {
            throw new Error('You are not authorized to request a verification code. Please log in and try again.');
          } else if (error.message === 'User not found') {
            throw new Error('We could not find an account associated with this email. Please check and try again.');
          } else {
            throw new Error(error.message || 'An unexpected error occurred. Please try again.');
          }
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