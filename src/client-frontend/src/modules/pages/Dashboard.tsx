import React from 'react';
import AppAppBar from '../views/AppAppBar';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';
import {
  Box,
  Card,
  CardContent,
  Button
} from '@mui/material';
import Typography from '../components/Typography';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function Dashboard() {
  const language = useSelector(selectLanguage);

  return (
    <React.Fragment>
    <AppAppBar />
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 2 }}>
      {/* Inner Box limits the max width of the dashboard content */}
      <Box sx={{ width: '100%', maxWidth: 600 }}>
    <Typography
            variant="h4"
            marked="center"
            align="center"
            sx={{ marginY: '40px' }}
          >
            {language === 'en-US'? 'Coming Soon' : language === 'fr-FR' ? `À Venir` : language === 'es-MX' ? 'Muy Pronto' : ''}
          </Typography>
        {/* -------------------------------
            Church Goals Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {language === 'en-US'? 'Church Goals' : language === 'fr-FR' ? `Objectifs de l'Église` : language === 'es-MX' ? 'Metas de la Iglesia' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and update the church goals.
              {language === 'en-US'? `Review and update the church goals.` 
              : language === 'fr-FR' ? `Révisez et mettez à jour les objectifs de l’église.` 
              : language === 'es-MX' ? 'Revisar y actualizar las metas de la iglesia.' 
              : ''}
            </Typography>
            {/* Add more content or interactive elements as needed */}
          </CardContent>
        </Card>

        {/* -------------------------------
            Bible Study Chart Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {language === 'en-US'? `Bible Study Chart` 
              : language === 'fr-FR' ? `Tableau d'étude Biblique` 
              : language === 'es-MX' ? 'Cuadro de Estudio Bíblico' 
              : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'en-US'? `View your Bible study progress in this chart.` 
              : language === 'fr-FR' ? `Consultez la progression de votre étude biblique dans ce tableau.` 
              : language === 'es-MX' ? 'Vea el progreso de su estudio bíblico en este gráfico.' 
              : ''}
            </Typography>
            {/* Placeholder for the chart */}
            <Box
              sx={{
                height: 200,
                mt: 2,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography>Chart goes here</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* -------------------------------
            Admin App Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {language === 'en-US'? 'Admin App' : language === 'fr-FR' ? `Application d'administration` : language === 'es-MX' ? 'Aplicación de Administración' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {language === 'en-US'? `Access the admin panel.`
              : language === 'fr-FR' ? `Accédez au panneau d'administration.`
              : language === 'es-MX' ? 'Acceda al panel de administración.'
              : ''}
            </Typography>
            {/* The button acts as a link to the admin app */}
            <Button variant="contained" color="secondary" href="/admin">
              {language === 'en-US'? `Go to Admin App`
              : language === 'fr-FR' ? `Aller à l'application d'administration`
              : language === 'es-MX' ? 'Ir a la aplicación de administración'
              : ''}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
    <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Dashboard);