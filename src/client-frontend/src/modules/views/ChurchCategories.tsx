import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

const ImageBackdrop = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: '#000',
  opacity: 0.5,
  transition: theme.transitions.create('opacity'),
}));

const ImageIconButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  display: 'block',
  padding: 0,
  borderRadius: 0,
  height: '40vh',
  [theme.breakpoints.down('md')]: {
    width: '100% !important',
    height: 100,
  },
  '&:hover': {
    zIndex: 1,
  },
  '&:hover .imageBackdrop': {
    opacity: 0.15,
  },
  '&:hover .imageMarked': {
    opacity: 0,
  },
  '&:hover .imageTitle': {
    border: '4px solid currentColor',
  },
  '& .imageTitle': {
    position: 'relative',
    padding: `${theme.spacing(2)} ${theme.spacing(4)} 14px`,
  },
  '& .imageMarked': {
    height: 3,
    width: 18,
    background: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(50% - 9px)',
    transition: theme.transitions.create('opacity'),
  },
}));


export default function ChurchCategories() {
  const language = useSelector(selectLanguage);
  
  const images = [
    {
      url: './images/alex.jpg',
      title: `${language=='en-US' ? 'Location' : language=='fr-FR' ? 'Emplacement' : language=='es-MX' ? 'Ubicación' : ''}`,
      width: '40%',
      link: '/location'
    },
    {
      url: './images/devo.jpg',
      title: `${language=='en-US' ? 'Contact Us' : language=='fr-FR' ? 'Contactez-nous' : language=='es-MX' ? 'Contáctenos' : ''}`,
      width: '20%',
      link: '/contactus'
    },
    {
      url: './images/rcw.png',
      title: `${language=='en-US' ? 'Worldwide Movement' : language=='fr-FR' ? 'Mouvement Mondial' : language=='es-MX' ? 'Movimiento Mundial' : ''}`,
      width: '40%',
      link: 'https://restoredchurchworldwide.org/'
    },
    {
      url: './images/happy.jpg',
      title: `${language=='en-US' ? 'Missions' : language=='fr-FR' ? 'Missions' : language=='es-MX' ? 'Misiones' : ''}`,
      width: '28%',
      link: '/missions'
    },
    {
      url: './images/henry.jpg',
      title: `${language=='en-US' ? 'Benevolence' : language=='fr-FR' ? 'Bienveillance' : language=='es-MX' ? 'Benevolencia' : ''}`,
      width: '34%',
      link: '/benevolence'
    },
    {
      url: './images/preach.jpg',
      title: `${language=='en-US' ? 'Contribution' : language=='fr-FR' ? 'Contribution' : language=='es-MX' ? 'Contribución' : ''}`,
      width: '38%',
      link: '/contribution'
    }
  ];

  return (
    <Container component="section" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h3" marked="center" align="center" component="h2">
        {language=='en-US' ? 'All are welcome'
        : language=='fr-FR' ? 'Tous sont les bienvenus' 
        : language=='es-MX' ? 'Todos son bienvenidos' : ''}
      </Typography>
      <Box sx={{ mt: 8, display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image) => (
          <ImageIconButton
            key={image.title}
            style={{
              width: image.width,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                backgroundImage: `url(${image.url})`,
              }}
              />
            <ImageBackdrop className="imageBackdrop" />
            <Box 
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'common.white',
              }}
              >
              <Typography
                component="h3"
                variant="h6"
                color="inherit"
                className="imageTitle"
                onClick={() => window.location.href = image.link || ''}
              >
                {image.title}
                <div className="imageMarked" />
              </Typography>
            </Box>
          </ImageIconButton>
        ))}
      </Box>
    </Container>
  );
}