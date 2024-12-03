import React from 'react';
import Box from '@mui/material/Box';
import Typography from '../components/Typography';
import AppAppBar from '../views/AppAppBar';
import FormButton from '../form/FormButton';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../views/AppFooter';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import withRoot from '../withRoot';
import { selectLanguage } from '../ducks/userSlice';

function AccountCreated() {
  const user = useSelector((state: RootState) => state.userAuthAndInfo.user);
  const navigate = useNavigate();
  const language = useSelector(selectLanguage);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <React.Fragment>
      <AppAppBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: 2,
        }}
      >
        <Typography variant="h3" gutterBottom marked="center" align="center">
          {language === 'en-US'? 'Account Created!' : language === 'fr-FR' ? `Compte Créé !` : language === 'es-MX' ? '¡Cuenta Creada!' : ''}
        </Typography>
        <Typography variant="h4" align="center" mt={'4rem'}>
          {`${language === 'en-US'? 'Welcome' : language === 'fr-FR' ? `Bienvenu` : language === 'es-MX' ? 'Bienvenido' : ''} ${user?.user_name}!`}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2, mt: '4rem' }}>
          {language === 'en-US'? 'Your account has been successfully created. You can now return to Home.' 
              : language === 'fr-FR' ? `Votre compte a été créé avec succès. Vous pouvez maintenant retourner à l'accueil.` 
              : language === 'es-MX' ? 'Su cuenta ha sido creada exitosamente. Ahora puedes regresar a Inicio.' 
              : ''}
        </Typography>
        <FormButton
          sx={{ mt: 3, mb: 2, paddingX: 10 }}
          color="secondary"
          onClick={handleContinue}
        >
          {language === 'en-US'? 'Return to Home' : language === 'fr-FR' ? `Retour à la Maison` : language === 'es-MX' ? 'Regresar a Casa' : ''}
        </FormButton>
      </Box>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(AccountCreated);
