import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';

function ChurchAboutUs() {
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
          About Us
        </Typography>
        <div>
          <Box>
            <Typography variant="h4" component="h2" my={3}>
              Mission
            </Typography>
            <Typography>
            The mission of our church is to make disciples of Jesus of all nations by every member themselves being disciples and in discipling relationships to mature in Christ.
            </Typography>
            <Typography fontStyle="italic" my={2}>
            Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.” (Matthew 28:19-20)
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" component="h2" my={3} mt={6}>
              Vision
            </Typography>
            <Typography>
            In order to accomplish the great commission of Jesus, we have a vision for all nations to be reached by every disciple making a disciple and planting churches worldwide to achieve this vision. In order to do this, each year we have special missions contributions to send out disciples to plant churches or strengthen churches. We believe in biblical salvation. Salvation being a free gift from God in response to obedience to the gospel giving everyone an opportunity to hear the message.
            </Typography>
            <Typography fontStyle="italic" my={2}>
            “This is good, and pleases God our Savior, who wants all people to be saved and to come to a knowledge of the truth. For there is one God and one mediator between God and mankind, the man Christ Jesus.” (1 Timothy 2:3-4)
            </Typography>
          </Box>
        </div>
      </Container>
    </Box>
  );
}

export default ChurchAboutUs;
