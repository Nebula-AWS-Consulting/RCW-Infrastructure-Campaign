import React from 'react';
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
import { email, required } from '../form/validation';
import AppForm from '../views/AppForm';
import RFTextField from '../form/RFTextField';
import FormFeedback from '../form/FormFeedback';
import FormButton from '../form/FormButton';
import { SERVER } from '../../App';
import { useNavigate } from 'react-router-dom';

function ContactUs(){
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(String);
  const navigate = useNavigate();

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['name', 'email', 'password'], values);
  
    if (!errors.email) {
      const emailError = email(values.email);
      if (emailError) {
        errors.email = emailError;
      }
    }
  }

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
            throw new Error('Please fill out all fields: name, email, and message.');
          } else if (error.message === 'The message was rejected. Ensure the email address is valid.') {
            throw new Error('Your email address is invalid. Please enter a valid email address.');
          } else if (error.message === "The sender's email address is not verified. Please contact support.") {
            throw new Error('The email address you provided is not verified. Please use a verified email or contact support.');
          } else if (error.message === 'There was a configuration issue with the email service. Please try again later.') {
            throw new Error('We encountered a technical issue while sending your message. Please try again later.');
          } else {
            throw new Error(error.message || 'An unexpected error occurred. Please try again.');
        }
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
            Contact Us
          </Typography>
          <Typography variant="body2" align="center" mt={3} width={'80%'} justifySelf={'center'}>
            We'd love to hear from you! Please fill out the form below and we'll get back to you as soon as possible.
          </Typography>
        </React.Fragment>
        <Form
          onSubmit={handleSubmit}
          subscription={{ submitting: true }}
          // validate={validate}
        >
          {({ handleSubmit: handleSubmit2, submitting }) => (
            <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
                <Field
                  fullWidth
                  autoFocus
                  size="large"
                  component={RFTextField}
                  disabled={submitting || sent}
                  required
                  name="name"
                  label="Name"
                  margin="normal"
                />
              <Field
                autoComplete="email"
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
                component={RFTextField}
                disabled={submitting || sent}
                fullWidth
                multiline
                rows={6}
                label="Message"
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
                {submitting || sent ? 'In progress…' : 'Send Message'}
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
                Address
                </Typography>
                <Typography variant="body1">
                123 Main Street<br />
                Las Vegas, NV 89101
                </Typography>
            </Box>
            </Grid>
            <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
                <Phone color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" gutterBottom>
                Phone
                </Typography>
                <Typography variant="body1">
                (123) 456-7890
                </Typography>
            </Box>
            </Grid>
            <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
                <Email color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" gutterBottom>
                Email
                </Typography>
                <Typography variant="body1">
                info@restoredchurchlv.com
                </Typography>
            </Box>
            </Grid>
        </Grid>
    </Box>
    <Box sx={{ mt: 8, pb: 8, pt: 2, background: 'url(/churchContactUsDots.png)' }}>
          <Box sx={{backgroundColor: 'secondary.light', width: '60%', padding: 2, px: 5, borderRadius: 3, justifySelf: 'center'}}>
        <Typography variant="h4" align="center" marked='center' gutterBottom>
            Find Us Here
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18... (your Google Maps embed link)"
            width="100%"
            height="400"
            style={{ border: 0, maxWidth: '600px' }}
            allowFullScreen={false}
            loading="lazy"
            ></iframe>
        </Box>
          </Box>
    </Box>
    <AppFooter />
    </React.Fragment>
  );
};

export default withRoot(ContactUs);
