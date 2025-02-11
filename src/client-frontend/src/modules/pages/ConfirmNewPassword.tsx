import React from 'react'
import AppAppBar from '../views/AppAppBar'
import AppFooter from '../views/AppFooter'
import AppForm from '../views/AppForm'
import { Field, Form } from 'react-final-form'
import { Box } from '@mui/material'
import FormButton from '../form/FormButton'
import Typography from '../components/Typography'
import { useNavigate } from 'react-router-dom'
import { email, required } from '../form/validation'
import RFTextField from '../form/RFTextField'
import FormFeedback from '../form/FormFeedback'
import { SERVER } from '../../App'
import withRoot from '../withRoot'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../ducks/userSlice'

function ConfirmNewPassword() {
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const navigate = useNavigate()
  const language = useSelector(selectLanguage);

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
        setSubmitError('');

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
              const errorData = await response.json();
              throw { 
                message: errorData.message
              };
            }
        
            await response.json();
            navigate('/auth/signin')
          } catch (error: any) {
              const message = error.message || 'An unexpected error occurred. Please try again later.';
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
                    {language === 'en-US'? 'Confirm Password' : language === 'fr-FR' ? `Confirmez le mot de Passe` : language === 'es-MX' ? 'Confirmar Contraseña' : ''}
                </Typography>
                <Typography variant="body2" align="center" width={'80%'} justifySelf={'center'}>
                    {language === 'en-US'? `Enter the information below and we'll update your password.` 
                  : language === 'fr-FR' ? `Entrez les informations ci-dessous et nous mettrons à jour votre mot de passe.` 
                  : language === 'es-MX' ? 'Ingrese la información a continuación y actualizaremos su contraseña.' 
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
                    <Field
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        label={language === 'en-US'? 'Confirmation Code' : language === 'fr-FR' ? `Code de Confirmation` : language === 'es-MX' ? 'Código de Confirmación' : ''}
                        margin="normal"
                        name="confirmation_code"
                        required
                        size="large"
                    />
                    <Field
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        label={language === 'en-US'? 'New Password' : language === 'fr-FR' ? `Nouveau mot de Passe` : language === 'es-MX' ? 'Nueva Contraseña' : ''}
                        margin="normal"
                        name="new_password"
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
                          ? 'Set new password'
                          : language == 'fr-FR'
                          ? 'Définir un nouveau mot de passe'
                          : language == 'es-MX'
                          ? 'Establecer nueva contraseña'
                          : ''}
                    </FormButton>
                    </Box>
                )}
                </Form>
            </AppForm> 
        <AppFooter />
    </React.Fragment>
  )
}

export default withRoot(ConfirmNewPassword)