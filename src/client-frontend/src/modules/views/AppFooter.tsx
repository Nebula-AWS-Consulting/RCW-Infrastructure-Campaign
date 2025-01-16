import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import TextField from '../components/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { selectLanguage, setLanguage } from '../ducks/userSlice';
import { useMediaQuery } from '@mui/material';

function Copyright() {
  return (
    <React.Fragment>
      {'© '}
      <Link color="inherit" href={`https://${import.meta.env.VITE_DOMAIN}.org/`}>
      {import.meta.env.VITE_DOMAIN}
      </Link>{' '}
      {new Date().getFullYear()}
    </React.Fragment>
  );
}

const iconStyle = {
  width: 48,
  height: 48,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'warning.main',
  mr: 1,
  '&:hover': {
    bgcolor: 'warning.dark',
  },
};

const LANGUAGES = [
  {
    code: 'en-US',
    name: 'English',
  },
  {
    code: 'fr-FR',
    name: 'Français',
  },
  {
    code: 'es-MX',
    name: 'Español',
  },
];

export default function AppFooter() {
  const dispatch = useDispatch();
  const language = useSelector(selectLanguage);
  const smallScreen = useMediaQuery('(max-width: 440px)');

  const handleChangeLanguage = (e: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setLanguage(e.target.value as string));
  };

  return (
    <Typography
      component="footer"
      sx={{ display: 'flex', bgcolor: 'secondary.light' }}
    >
      <Container sx={{ my: 8, display: 'flex' }}>
        <Grid container spacing={5}>
          <Grid item xs={smallScreen ? 12 : 6} sm={4} md={3}>
            <Grid
              container
              direction="column"
              spacing={2}
              sx={{ justifyContent: 'flex-end', height: 120 }}
            >
              <Grid item sx={{ display: 'flex' }}>
                <Box
                  component="a"
                  href={import.meta.env.VITE_FACEBOOK_URL}
                  sx={iconStyle}
                  borderRadius={'8px'}
                >
                  <img
                    src="/icons/appFooterFacebook.png"
                    alt="Facebook"
                  />
                </Box>
                <Box
                  component="a"
                  href={import.meta.env.VITE_INSTAGRAM_URL}
                  sx={iconStyle}
                  borderRadius={'8px'}
                >
                  <img src="/icons/appFooterInstagram.png" alt="Instagram" />
                </Box>
              </Grid>
              <Grid item>
                <Copyright />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={smallScreen ? 12 : 6} sm={4} md={2}>
            <Typography variant="h6" marked="left" gutterBottom>
            {language=='en-US' ? 'Legal' : language=='fr-FR' ? 'Légal' : language=='es-MX' ? 'Legal' : ''}
            </Typography>
            <Box component="ul" sx={{ m: 0, listStyle: 'none', p: 0 }}>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/terms">{language=='en-US' ? 'Terms' : language=='fr-FR' ? 'Termes' : language=='es-MX' ? 'Términos' : ''}</Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/privacy">{language=='en-US' ? 'Privacy' : language=='fr-FR' ? 'Confidentialité' : language=='es-MX' ? 'Privacidad' : 'Privacidad'}</Link>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8} md={4}>
            <Typography variant="h6" marked="left" gutterBottom>
            {language=='en-US' ? 'Language' : language=='fr-FR' ? 'Langue' : language=='es-MX' ? 'Idioma' : ''}
            </Typography>
            <TextField
              select
              size="medium"
              variant="standard"
              value={language}
              onChange={handleChangeLanguage}
              SelectProps={{
                native: true,
              }}
              sx={{ mt: 1, width: 150 }}
            >
              {LANGUAGES.map((language) => (
                <option value={language.code} key={language.code}>
                  {language.name}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Container>
    </Typography>
  );
}
