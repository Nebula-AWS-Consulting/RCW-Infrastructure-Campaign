import Button from '../components/Button';
import Typography from '../components/Typography';
import ChurchHeroLayout from './ChurchHeroLayout';
import { Box } from '@mui/material';

const backgroundImage =
  './images/sundaysService.jpg';

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
        RESTORING TRUTH WORLDWIDE
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
          color="secondary"
          variant="contained"
          size="large"
          component="a"
          sx={{ minWidth: 200 }}
        >
          Contact Us
        </Button>
      </Box>
      <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
        Discover the experience
      </Typography>
    </ChurchHeroLayout>
  );
}
