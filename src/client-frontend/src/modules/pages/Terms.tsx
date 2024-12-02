import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Markdown from '../components/Markdown';
import Typography from '../components/Typography';
import AppAppBar from '../views/AppAppBar';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';
import terms from '../views/terms.md?raw';
import termsSpanish from '../views/termsSpanish.md?raw';
import termsFrench from '../views/termsFrench.md?raw';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function Terms() {
  const language = useSelector(selectLanguage);

  const termsContent =
  language === 'en-US'
    ? terms
    : language === 'fr-FR'
    ? termsFrench
    : language === 'es-MX'
    ? termsSpanish
    : '';
  
  return (
    <React.Fragment>
      <AppAppBar />
      <Container>
        <Box sx={{ mt: 7, mb: 12 }}>
          <Typography variant="h3" gutterBottom marked="center" align="center">
            {language=='en-US' ? 'Terms' : language=='fr-FR' ? 'Termes' : language=='es-MX' ? 'Términos' : ''}
          </Typography>
          <Markdown>{termsContent}</Markdown>
        </Box>
      </Container>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Terms);