import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import Snackbar from '../components/Snackbar';
import Button from '../components/Button';
import { Field, Form } from 'react-final-form';
import { email, required } from '../form/validation';
import RFTextField from '../form/RFTextField';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';
import { SERVER } from '../../App';

function ChurchContactUs() {
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const language = useSelector(selectLanguage);

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['name', 'email', 'message'], values);
  
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
        `${SERVER}/contact-us`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: values.name,
            email: values.email,
            message: values.message,
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
      setOpen(true);
    } catch (error: any) {
        const message = error.message || 'An unexpected error occurred. Please try again later.';
        alert(message);
    } finally {
      setSent(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container component="section" sx={{ my: 10, display: 'flex' }}>
      <Grid container>
        <Grid item xs={12} md={6} sx={{ zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'warning.main',
              py: 8,
              px: 3,
            }}
          >
            <Box sx={{ maxWidth: 400 }}>
              <Typography variant="h2" component="h2" gutterBottom>
                {language=='en-US' ? 'Contact Us' : language=='fr-FR' ? 'Contactez-nous' : language=='es-MX' ? 'Contacta con nosotros' : ''}
              </Typography>
              <Typography variant="h5" mb={1}>
                {language=='en-US' ? 'Get more information.' : language=='fr-FR' ? `Obtenez plus d'informations.` : language=='es-MX' ? 'Obtenga más información.' : ''}
              </Typography>
              <Typography variant="h5">
                {language=='en-US' ? 'Set up a bible study.' : language=='fr-FR' ? `Organisez une étude biblique.` : language=='es-MX' ? 'Organice un estudio bíblico.' : ''}
              </Typography>
              <Form
                onSubmit={handleSubmit}
                subscription={{ submitting: true }}
                validate={validate}
              >
                {({ handleSubmit: formSubmit, submitting }) => (
                  <form
                    onSubmit={formSubmit}
                    noValidate
                    style={{ marginTop: 24 }}
                  >
                    <Box>
                      <Field
                        noBorder
                        placeholder={
                          language == 'en-US'
                            ? 'Your Name'
                            : language == 'fr-FR'
                            ? 'Votre nom'
                            : language == 'es-MX'
                            ? 'Tu nombre'
                            : ''
                        }
                        sx={{ width: '100%', mt: 1, mb: 0.25 }}
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        name="name"
                        required
                      />
                      <Field
                        noBorder
                        placeholder={
                          language == 'en-US'
                            ? 'Your Email'
                            : language == 'fr-FR'
                            ? 'Votre email'
                            : language == 'es-MX'
                            ? 'Tu correo electrónico'
                            : ''
                        }
                        sx={{ width: '100%', mt: 1, mb: 0.25 }}
                        component={RFTextField}
                        disabled={submitting || sent}
                        fullWidth
                        name="email"
                        required
                      />
                      <Field
                        noBorder
                        placeholder={
                          language == 'en-US'
                            ? 'Message'
                            : language == 'fr-FR'
                            ? 'Votre message'
                            : language == 'es-MX'
                            ? 'Tu mensaje'
                            : ''
                        }
                        component={RFTextField}
                        sx={{ width: '100%', mt: 1, mb: 3 }}
                        disabled={submitting || sent}
                        fullWidth
                        name="message"
                        required
                      />
                      <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        sx={{ width: '100%' }}
                        disabled={submitting || sent}
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
                          ? 'GET IN TOUCH'
                          : language == 'fr-FR'
                          ? 'ENTRER EN CONTACT'
                          : language == 'es-MX'
                          ? 'PONTE EN CONTACTO'
                          : ''}
                      </Button>
                    </Box>
                  </form>
                )}
              </Form>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { md: 'block', xs: 'none' }, position: 'relative' }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -67,
              left: -67,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 600,
              height: '60%',
              overflow: 'hidden',
              background: 'url(/churchContactUsDots.png)'
            }}
          />
          <Box
            component="img"
            src="/images/alexanders.jpeg"
            alt="call to action"
            sx={{
              position: 'absolute',
              top: -28,
              left: -28,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              maxWidth: 500,
              objectFit: 'cover',
              objectPosition: '30% 30%',
            }}
          />
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        closeFunc={handleClose}
        message={
          language == 'en-US'
            ? 'We will contact you soon!'
            : language == 'fr-FR'
            ? 'Nous vous contacterons bientôt.'
            : language == 'es-MX'
            ? 'Lo contactaremos pronto.'
            : ''
        }
      />
    </Container>
  );
}

export default ChurchContactUs;
