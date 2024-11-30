import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../ducks/userSlice';

function ChurchAboutUs() {
  const language = useSelector(selectLanguage);
  
  return (
    <Box
      component="section"
      sx={{ display: 'flex', bgcolor: 'secondary.light', overflow: 'hidden' }}
    >
      <Container
        sx={{
          mt: 10,
          mb: 15,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '70%'
        }}
      >
        <Box
          component="img"
          src="/appCurvyLines.png"
          alt="curvy lines"
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            top: -180,
            opacity: 0.7,
          }}
        />
        <Typography variant="h3" marked="center" component="h2" sx={{ mb: 8 }}>
        {language=='en-US' ? 'About Us' : language=='fr-FR' ? 'À propos de nous' : language=='es-MX' ? 'Sobre nosotros' : ''}
        </Typography>
        <div>
          <Box>
            <Typography variant="h4" component="h2" my={3}>
            {language=='en-US' ? 'Mission' : language=='fr-FR' ? 'Mission' : language=='es-MX' ? 'Misión' : ''}
            </Typography>
            <Typography>
            {language=='en-US' ? 'The mission of our church is to make disciples of Jesus of all nations by every member themselves being disciples and in discipling relationships to mature in Christ.'
              : language=='fr-FR' ? 'La mission de notre église est de faire des disciples de Jésus de toutes les nations en faisant en sorte que chaque membre soit lui-même disciple et dans des relations de disciples pour mûrir en Christ.' 
              : language=='es-MX' ? 'La misión de nuestra iglesia es hacer discípulos de Jesús en todas las naciones, siendo cada miembro mismo discípulo y en relaciones de discipulado para madurar en Cristo.' : ''}
            </Typography>
            <Typography fontStyle="italic" my={2}>
            {language=='en-US' ? '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.” (Matthew 28:19-20)"'
              : language=='fr-FR' ? '«Allez donc faire de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit, et apprenez-leur à obéir à tout ce que je vous ai commandé. Et sûrement, je serai toujours avec vous, jusqu’à la fin des temps. (Matthieu 28 : 19-20)' 
              : language=='es-MX' ? '"Por tanto, id y haced discípulos de todas las naciones, bautizándolos en el nombre del Padre y del Hijo y del Espíritu Santo, y enseñándoles a obedecer todo lo que os he mandado. Y ciertamente yo estaré con vosotros siempre, hasta el fin de los tiempos.” (Mateo 28:19-20)' : ''}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" component="h2" my={3} mt={6}>
              {language=='en-US' ? 'Vision' : language=='fr-FR' ? 'Vision' : language=='es-MX' ? 'Visión' : ''}
            </Typography>
            <Typography>
            {language=='en-US' ? 'In order to accomplish the great commission of Jesus, we have a vision for all nations to be reached by every disciple making a disciple and planting churches worldwide to achieve this vision. In order to do this, each year we have special missions contributions to send out disciples to plant churches or strengthen churches. We believe in biblical salvation. Salvation being a free gift from God in response to obedience to the gospel giving everyone an opportunity to hear the message.'
              : language=='fr-FR' ? `Afin d'accomplir la grande mission de Jésus, nous avons une vision pour que toutes les nations soient atteintes par chaque disciple faisant un disciple et implantant des églises dans le monde entier pour réaliser cette vision. Pour ce faire, nous avons chaque année des contributions missionnaires spéciales pour envoyer des disciples implanter des églises ou renforcer des églises. Nous croyons au salut biblique. Le salut est un don gratuit de Dieu en réponse à l'obéissance à l'Évangile, donnant à chacun la possibilité d'entendre le message.` 
              : language=='es-MX' ? 'Para poder cumplir la gran comisión de Jesús, tenemos una visión de que todas las naciones sean alcanzadas por cada discípulo que haga discípulos y plante iglesias en todo el mundo para lograr esta visión. Para poder hacer esto, cada año tenemos contribuciones misioneras especiales para enviar discípulos a plantar iglesias o fortalecer iglesias. Creemos en la salvación bíblica. La salvación es un regalo gratuito de Dios en respuesta a la obediencia al evangelio, dando a todos la oportunidad de escuchar el mensaje.' : ''}
            </Typography>
            <Typography fontStyle="italic" my={2}>
            {language=='en-US' ? '“This is good, and pleases God our Savior, who wants all people to be saved and to come to a knowledge of the truth. For there is one God and one mediator between God and mankind, the man Christ Jesus.” (1 Timothy 2:3-4)'
              : language=='fr-FR' ? '«Cela est bien et cela plaît à Dieu notre Sauveur, qui veut que tous les hommes soient sauvés et parviennent à la connaissance de la vérité. Car il y a un seul Dieu et un seul médiateur entre Dieu et l’humanité, l’homme Jésus-Christ. (1 Timothée 2:3-4)' 
              : language=='es-MX' ? '“Esto es bueno y agrada a Dios nuestro Salvador, que quiere que todos los hombres se salven y lleguen al conocimiento de la verdad. Porque hay un solo Dios y un solo mediador entre Dios y los hombres, Cristo Jesús hombre”. (1 Timoteo 2:3-4)' : ''}
            </Typography>
          </Box>
        </div>
      </Container>
    </Box>
  );
}

export default ChurchAboutUs;
