import Button from '../components/Button';
import Typography from '../components/Typography';
import ChurchHeroLayout from './ChurchHeroLayout';
import { Box } from '@mui/material';

const backgroundImage =
  'https://images.unsplash.com/photo-1534854638093-bada1813ca19?auto=format&fit=crop&w=1400';

export default function ChurchHero() {
  return (
    <ChurchHeroLayout
      sxBackground={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: '#7fc7d9', // Average color of the background image.
        backgroundPosition: 'center',
      }}
    >
      {/* Increase the network loading priority of the background image. */}
      <img
        style={{ display: 'none' }}
        src={backgroundImage}
        alt="increase priority"
      />
      <Typography color="inherit" align="center" variant="h2" marked="center">
        Upgrade your Sundays
      </Typography>
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 } }}
      >
        Come worship this Sunday
      </Typography>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          component="a"
          href="/auth/signup/"
          sx={{ minWidth: 200, mr: '1rem' }}
        >
          Donate
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="large"
          component="a"
          href="/auth/signup/"
          sx={{ minWidth: 200 }}
        >
          Register
        </Button>
      </Box>
      <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </Typography>
    </ChurchHeroLayout>
  );
}
