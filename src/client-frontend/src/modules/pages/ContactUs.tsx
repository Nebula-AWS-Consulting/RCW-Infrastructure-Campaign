import React, { useState } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import {
  Grid,
  Box
} from '@mui/material';
import Typography from '../components/Typography';
import withRoot from '../withRoot';
import { Email, LocationOn, Phone } from '@mui/icons-material';
import AppAppBar from '../views/AppAppBar';
import AppFooter from '../views/AppFooter';
import AppForm from '../views/AppForm';
import RFTextField from '../form/RFTextField';
import FormFeedback from '../form/FormFeedback';
import FormButton from '../form/FormButton';
import { SERVER } from '../../App';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function ContactUs(){
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const language = useSelector(selectLanguage);
  const [showThankYouBanner, setShowThankYouBanner] = useState(false);

  const handleSubmit = async (values: { [index: string]: string }) => {
    setSent(true);
    setSubmitError('');
  
    try {
      const response = await fetch(
        `${SERVER}/contact-us`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: values.name,
            email: values.email,
            message: values.message
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
  
      await response.json();
    } catch (error: any) {
        if (error.message === 'All fields are required: name, email, and message.') {
            setSubmitError('Please fill out all fields: name, email, and message.');
          } else if (error.message === 'The message was rejected. Ensure the email address is valid.') {
            setSubmitError('Your email address is invalid. Please enter a valid email address.');
          } else if (error.message === "The sender's email address is not verified. Please contact support.") {
            setSubmitError('The email address you provided is not verified. Please use a verified email or contact support.');
          } else if (error.message === 'There was a configuration issue with the email service. Please try again later.') {
            setSubmitError('We encountered a technical issue while sending your message. Please try again later.');
          } else {
            setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
        }
    } finally {
      setSent(false);
      setShowThankYouBanner(true)
    }
  };

  return (
    <React.Fragment>
    <AppAppBar />
    <AppForm>
        <React.Fragment>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            { language === 'en-US'
              ? 'Contact Us'
              : language === 'fr-FR'
              ? 'Contactez-nous'
              : language === 'es-MX'
              ? 'Contactanos'
              : ''}
          </Typography>
          <Typography variant="body2" align="center" mt={3} width={'80%'} justifySelf={'center'}>
          { language === 'en-US'
              ? `We'd love to hear from you! Please fill out the form below and we'll get back to you as soon as possible.`
              : language === 'fr-FR'
              ? 'Nous aimerions avoir de vos nouvelles ! Veuillez remplir le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.'
              : language === 'es-MX'
              ? '¡Nos encantaría saber de usted! Complete el siguiente formulario y nos comunicaremos con usted lo antes posible.'
              : ''}
          </Typography>
        </React.Fragment>
        <Form
          onSubmit={handleSubmit}
          subscription={{ submitting: true }}
        >
          {({ handleSubmit: handleSubmit2, submitting }) => (
            <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
                {showThankYouBanner && (
                <FormFeedback isDefault sx={{ mb: '1rem', mt: 2, textAlign: 'center', width: '80%', justifySelf: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" color="white">
                    We will contact you soon!
                    </Typography>
                </FormFeedback>
                )}
                <Field
                  fullWidth
                  autoFocus
                  size="large"
                  component={RFTextField}
                  disabled={submitting || sent}
                  required
                  name="name"
                  label={ language === 'en-US'? 'Name' : language === 'fr-FR' ? 'Nom' : language === 'es-MX' ? 'Nombre' : ''}
                  label={ language === 'en-US'? 'Name' : language === 'fr-FR' ? 'Nom' : language === 'es-MX' ? 'Nombre' : ''}
                  margin="normal"
                />
              <Field
                autoComplete="email"
                component={RFTextField}
                disabled={submitting || sent}
                fullWidth
                label={language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
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
                multiline
                rows={6}
                label={language === 'en-US'? 'Message' : language === 'fr-FR' ? 'Message' : language === 'es-MX' ? 'Mensaje' : ''}
                label={language === 'en-US'? 'Message' : language === 'fr-FR' ? 'Message' : language === 'es-MX' ? 'Mensaje' : ''}
                margin="normal"
                name="message"
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
                            ? 'Sending...'
                            : language == 'fr-FR'
                            ? 'Envoi...'
                            : language == 'es-MX'
                            ? 'Enviando...'
                            : ''
                          : language == 'en-US'
                          ? 'Send Message'
                          : language == 'fr-FR'
                          ? 'Envoyer un Message'
                          : language == 'es-MX'
                          ? 'Enviar Mensaje'
                          : ''}
                {submitting || sent
                          ? language == 'en-US'
                            ? 'Sending...'
                            : language == 'fr-FR'
                            ? 'Envoi...'
                            : language == 'es-MX'
                            ? 'Enviando...'
                            : ''
                          : language == 'en-US'
                          ? 'Send Message'
                          : language == 'fr-FR'
                          ? 'Envoyer un Message'
                          : language == 'es-MX'
                          ? 'Enviar Mensaje'
                          : ''}
              </FormButton>
            </Box>
          )}
        </Form>
      </AppForm>
    <Box component='section' sx={{ mt: 4, width: '90%', justifySelf: 'center', backgroundColor: 'secondary.light', p: '5rem', borderRadius: '1rem' }}>
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
                <LocationOn color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" gutterBottom>
                {language === 'en-US'? 'Address' : language === 'fr-FR' ? 'Adresse' : language === 'es-MX' ? 'DIRECCIÓN' : ''}
                {language === 'en-US'? 'Address' : language === 'fr-FR' ? 'Adresse' : language === 'es-MX' ? 'DIRECCIÓN' : ''}
                </Typography>
                <Typography variant="body1">
                {import.meta.env.VITE_CONTACT_US_STREET_LOCATION}<br />
                {import.meta.env.VITE_CONTACT_US_CITY_LOCATION}
                </Typography>
            </Box>
            </Grid>
            <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
                <Phone color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" gutterBottom>
                {language === 'en-US'? 'Phone' : language === 'fr-FR' ? 'Téléphone' : language === 'es-MX' ? 'Teléfono' : ''}
                {language === 'en-US'? 'Phone' : language === 'fr-FR' ? 'Téléphone' : language === 'es-MX' ? 'Teléfono' : ''}
                </Typography>
                <Typography variant="body1">
                {import.meta.env.VITE_CONTACT_NUMBER}
                </Typography>
            </Box>
            </Grid>
            <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
                <Email color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" gutterBottom>
                {language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
                {language === 'en-US'? 'Email' : language === 'fr-FR' ? 'E-mail' : language === 'es-MX' ? 'Correo Electrónico' : ''}
                </Typography>
                <Typography variant="body1">
                {import.meta.env.VITE_CONTACT_EMAIL}
                </Typography> 
            </Box> {/* ENV Var */}
            </Grid>
        </Grid>
    </Box>
    <Box sx={{ mt: 8, pb: 8, pt: 2, background: 'url(/churchContactUsDots.png)' }}>
          <Box sx={{backgroundColor: 'secondary.light', width: '60%', padding: 2, px: 5, borderRadius: 3, justifySelf: 'center'}}>
        <Typography variant="h4" align="center" marked='center' gutterBottom>
        {language === 'en-US'? 'Find Us Here' : language === 'fr-FR' ? 'Trouvez-nous ici' : language === 'es-MX' ? 'Encuéntranos Aquí' : ''}
        {language === 'en-US'? 'Find Us Here' : language === 'fr-FR' ? 'Trouvez-nous ici' : language === 'es-MX' ? 'Encuéntranos Aquí' : ''}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <iframe
            src={import.meta.env.VITE_GOOGLE_MAP_IMBED}
            width="100%"
            height="400"
            style={{ border: 0, maxWidth: '600px' }}
            allowFullScreen={false}
            loading="lazy"
            ></iframe>
        </Box> {/* ENV Var */}
          </Box>
    </Box>
    <AppFooter />
    </React.Fragment>
  );
};

export default withRoot(ContactUs);
