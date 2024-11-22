import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import TextField from '../components/TextField';
import Snackbar from '../components/Snackbar';
import Button from '../components/Button';

function ChurchContactUs() {
  const [open, setOpen] = React.useState(false);

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
              <Typography variant="h5" mt={'1rem'}>
                Evangelist: Austin Alexander
              </Typography>
              <Typography variant="h5" ml={'1rem'}>
                Phone Number: (808)-208-4011
              </Typography>
              <Typography variant="h5" ml={'1rem'}>
                Email: austin.alexander@rcwmail.org
              </Typography>
              <Typography variant="h5" mt={'1rem'}>
                Woman's Ministry Leader: Gigi Alexander
              </Typography>
              <Typography variant="h5" ml={'1rem'}>
                Phone Number: (808)-498-9652
              </Typography>
              <Typography variant="h5" ml={'1rem'}>
                Email: gigi.alexander@rcwmail.org
              </Typography>
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
              background: 'url(/churchContactUsDots.png)',
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
              maxWidth: 600
            }}
          />
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        closeFunc={handleClose}
        message="We will send you our best offers, once a week."
      />
    </Container>
  );
}

export default ChurchContactUs;