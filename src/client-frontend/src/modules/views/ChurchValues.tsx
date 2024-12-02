import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

const item: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: 5,
};

function ChurchValues() {
  const language = useSelector(selectLanguage);
  
  return (
    <Box
      component="section"
      sx={{ display: 'flex', overflow: 'hidden', bgcolor: 'secondary.light' }}
    >
      <Container sx={{ mt: 15, mb: 15, display: 'flex', position: 'relative' }}>
        <Box
          component="img"
          src="/appCurvyLines.png"
          alt="curvy lines"
          sx={{ pointerEvents: 'none', position: 'absolute', top: -180 }}
        />
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/bible-icon.png"
                alt="suitcase"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3, textAlign: 'center' }}>
              {language=='en-US' ? 'WE ARE A BIBLE CHURCH'
              : language=='fr-FR' ? 'NOUS SOMMES UNE ÉGLISE BIBLIQUE' 
              : language=='es-MX' ? 'SOMOS UNA IGLESIA BÍBLICA' : ''}
              </Typography>
              <Typography variant="h5" textAlign="center">
              {language=='en-US' ? 'We are a Bible Church, not just a New Testament Church. All scripture is God-breathed and is useful and is to be applied to our lives.'
              : language=='fr-FR' ? 'Nous sommes une Église biblique, pas seulement une Église du Nouveau Testament. Toutes les Écritures sont inspirées par Dieu, sont utiles et doivent être appliquées à nos vies.' 
              : language=='es-MX' ? 'Somos una Iglesia Bíblica, no sólo una Iglesia del Nuevo Testamento. Todas las Escrituras son inspiradas por Dios, son útiles y deben aplicarse a nuestras vidas.' : ''}
              </Typography>
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {language=='en-US' ? '2 Timothy 3:16-17'
              : language=='fr-FR' ? '2 Timothée 3:16-17' 
              : language=='es-MX' ? '2 Timoteo 3:16-17' : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/apply-icon.png"
                alt="graph"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3, textAlign: 'center' }}>
              {language=='en-US' ? 'WE APPLY THE BIBLE'
              : language=='fr-FR' ? 'NOUS APPLIQUONS LA BIBLE' 
              : language=='es-MX' ? 'NOSOTROS APLICAMOS LA BIBLIA' : ''}
              </Typography>
              <Typography variant="h5" textAlign="center">
              {language=='en-US' ? 'Speak where the Bible is silent and be silent where the Bible speaks. We are free to practice and name anything as long as it does not conflict with scripture.'
              : language=='fr-FR' ? `Parlez là où la Bible se tait et taisez-vous là où la Bible parle. Nous sommes libres de pratiquer et de nommer n'importe quoi tant que cela n'entre pas en conflit avec les Écritures.` 
              : language=='es-MX' ? 'Habla donde la Biblia calla y guarda silencio donde la Biblia habla. Somos libres de practicar y nombrar cualquier cosa siempre que no entre en conflicto con las Escrituras.' : ''}
              </Typography>
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {language=='en-US' ? '2 Peter 1:20-21'
              : language=='fr-FR' ? '2 Pierre 1:20-21' 
              : language=='es-MX' ? '2 Pedro 1:20-21' : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/disciples-icon.png"
                alt="clock"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3, textAlign: 'center' }}>
              {language=='en-US' ? 'WE MAKE DISCIPLES'
              : language=='fr-FR' ? 'NOUS FAISONS DES DISCIPLES' 
              : language=='es-MX' ? 'NOSOTROS HACEMOS DISCIPULOS' : ''}
              </Typography>
              <Typography variant="h5" textAlign="center">
              {language=='en-US' ? 'We believe in every member of the body of Christ being disciples of Jesus and in relationships that teach and mature us in the teachings of Christ.'
              : language=='fr-FR' ? 'Nous croyons que chaque membre du corps du Christ est un disciple de Jésus et dans des relations qui nous enseignent et nous font mûrir dans les enseignements du Christ.' 
              : language=='es-MX' ? 'Creemos en que cada miembro del cuerpo de Cristo sea discípulo de Jesús y en relaciones que nos enseñen y maduren en las enseñanzas de Cristo.' : ''}
              </Typography>
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {language=='en-US' ? 'Matthew 28:18-20'
              : language=='fr-FR' ? 'Matthieu 28 : 18-20' 
              : language=='es-MX' ? 'Mateo 28:18-20' : ''}
              </Typography>
            </Box>
          </Grid>
          <Grid container item xs={12} justifyContent="center" spacing={5}>
            <Grid item xs={12} md={4}>
              <Box sx={item}>
                <Box
                  component="img"
                  src="/icons/missionaries-icon.png"
                  alt="clock"
                  sx={{ height: 105 }}
                />
                <Typography variant="h6" sx={{ my: 3, textAlign: 'center' }}>
                {language=='en-US' ? 'WE ARE MISSIONARIES'
              : language=='fr-FR' ? 'NOUS SOMMES MISSIONNAIRES' 
              : language=='es-MX' ? 'NOSOTROS SOMOS MISIONEROS' : ''}
                </Typography>
                <Typography variant="h5" textAlign="center">
                {language=='en-US' ? 'God’s will is for all people to be saved and to come to a knowledge of the truth. We believe in evangelizing the nations in this generation as Jesus teaches.'
              : language=='fr-FR' ? 'La volonté de Dieu est que tous les hommes soient sauvés et parviennent à la connaissance de la vérité. Nous croyons en l’évangélisation des nations de cette génération, comme l’enseigne Jésus.' 
              : language=='es-MX' ? 'La voluntad de Dios es que todas las personas se salven y lleguen al conocimiento de la verdad. Creemos en evangelizar las naciones en esta generación como enseña Jesús.' : ''}
                </Typography>
                <Typography variant="h6" color='secondary' textAlign="center" mt='1rem'>
                  {language=='en-US' ? '1 Timothy 2:3-4'
              : language=='fr-FR' ? '1 Timothée 2:3-4' 
              : language=='es-MX' ? '1 Timoteo 2:3-4' : ''}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={item}>
                <Box
                  component="img"
                  src="/icons/unity-icon.png"
                  alt="clock"
                  sx={{ height: 140 }}
                />
                <Typography variant="h6" sx={{ mb: 3, mt: -1, textAlign: 'center' }}>
                {language=='en-US' ? 'UNITY IN LEADERSHIP'
              : language=='fr-FR' ? 'UNITÉ DANS LE LEADERSHIP' 
              : language=='es-MX' ? 'UNIDAD EN EL LIDERAZGO' : ''}
                </Typography>
                <Typography variant="h5" textAlign="center">
                  {language=='en-US' ? 'God’s plan is for a central leadership of His people where there is unity, just as it was throughout the Bible when God’s people were unified there was a central leader.'
                : language=='fr-FR' ? 'Le plan de Dieu est d’avoir une direction centrale de Son peuple là où règne l’unité, tout comme c’était le cas tout au long de la Bible, lorsque le peuple de Dieu était unifié, il y avait un chef central.' 
                : language=='es-MX' ? 'El plan de Dios es un liderazgo central de Su pueblo donde haya unidad, tal como fue en toda la Biblia cuando el pueblo de Dios estaba unificado había un líder central.' : ''}
                </Typography>
                <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {language=='en-US' ? '1 Corinthians 4:14-17'
              : language=='fr-FR' ? '1 Corinthiens 4:14-17' 
              : language=='es-MX' ? '1 Corintios 4:14-17' : ''}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ChurchValues;
