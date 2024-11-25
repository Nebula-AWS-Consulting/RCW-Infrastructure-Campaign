import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import TextField from '../components/TextField';
import Snackbar from '../components/Snackbar';
import Button from '../components/Button';
import { Field, Form } from 'react-final-form';
import { email, required } from '../form/validation';
import RFTextField from '../form/RFTextField';

function ChurchContactUs() {
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const validate = (values: { [index: string]: string }) => {
    const errors = required(['email', 'phone number'], values);
  
    if (!errors.email) {
      const emailError = email(values.email);
      if (emailError) {
        errors.email = emailError;
      }
    }
    return errors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(true);
    
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
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
              <Typography variant="h2" component="h2" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="h5" mb={1}>
                Get more information.
              </Typography>
              <Typography variant="h5">
                Set up a bible study.
              </Typography>
              <Form
                onSubmit={handleSubmit}
                subscription={{ submitting: true }}
              >
              {({ handleSubmit: handleSubmit2, submitting }) => (
                <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
                  <Field
                    noBorder
                    placeholder="Your email"
                    component={RFTextField}
                    disabled={submitting || sent}
                    fullWidth
                    name='email'
                    required
                  />
                  <Field
                    noBorder
                    placeholder="Your Phone Number"
                    sx={{ width: '100%', mt: 1, mb: 3 }}
                    component={RFTextField}
                    disabled={submitting || sent}
                    fullWidth
                    name='Phone Number'
                    required
                  />
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    sx={{ width: '100%' }}
                  >
                    GET IN TOUCH
                  </Button>
                </Box>
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
            src="./images/alexanders.jpeg"
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
        message="We will contact you soon."
      />
    </Container>
  );
}

export default ChurchContactUs;