import { useSelector } from 'react-redux';
import Button from '../components/Button';
import Typography from '../components/Typography';
import ChurchHeroLayout from './ChurchHeroLayout';
import { Box } from '@mui/material';
import { selectLanguage } from '../ducks/userSlice';

const backgroundImage =
  './images/sundaysService.jpg';

export default function ChurchHero() {
  const language = useSelector(selectLanguage);
  
  return (
    <ChurchHeroLayout
      sxBackground={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: '#7fc7d9',
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
      {language=='en-US' ? 'RESTORING TRUTH WORLDWIDE'
       : language=='fr-FR' ? 'RESTAURATION DE LA VÉRITÉ' 
       : language=='es-MX' ? 'RESTAURANDO LA VERDAD' : ''}
      </Typography>
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { xs: 4, sm: 10 } }}
      >
      {language=='en-US' ? 'Come worship this sunday'
       : language=='fr-FR' ? 'Venez adorer ce dimanche' 
       : language=='es-MX' ? 'Ven a adorar este domingo' : ''}
      </Typography>
      <Box>
        <Button
          color="secondary"
          variant="contained"
          size="large"
          component="a"
          sx={{ minWidth: 200 }}
          href='/contactus'
        >
        {language=='en-US' ? 'CONTACT US'
       : language=='fr-FR' ? 'CONTACTEZ-NOUS' 
       : language=='es-MX' ? 'CONTÁCTANOS' : ''}
        </Button>
      </Box>
      <Typography variant="body2" color="inherit" sx={{ mt: 2 }}>
      {language=='en-US' ? 'Discover the experience'
       : language=='fr-FR' ? `Découvrez l'expérience` 
       : language=='es-MX' ? 'Descubre la experiencia' : ''}
      </Typography>
    </ChurchHeroLayout>
  );
}
