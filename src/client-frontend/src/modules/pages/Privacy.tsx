import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Markdown from '../components/Markdown';
import Typography from '../components/Typography';
import AppAppBar from '../views/AppAppBar';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';
import privacy from '../views/privacy.md?raw';
import privacySpanish from '../views/privacySpanish.md?raw';
import privacyFrench from '../views/privacyFrench.md?raw';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function Privacy() {
  const language = useSelector(selectLanguage);

  const privacyContent =
  language === 'en-US'
    ? privacy
    : language === 'fr-FR'
    ? privacyFrench
    : language === 'es-MX'
    ? privacySpanish
    : '';

  return (
    <React.Fragment>
      <AppAppBar />
      <Container>
        <Box sx={{ mt: 7, mb: 12 }}>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            {language=='en-US' ? 'Privacy' : language=='fr-FR' ? 'Confidentialité' : language=='es-MX' ? 'Privacidad' : ''}
          </Typography>
          <Markdown>{privacyContent}</Markdown>
        </Box>
      </Container>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Privacy);