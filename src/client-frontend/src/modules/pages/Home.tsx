import * as React from 'react';
import ChurchCategories from '../views/ChurchCategories';
import AppFooter from '../views/AppFooter';
import ChurchHero from '../views/ChurchHero';
import ChurchValues from '../views/ChurchValues';
import ChurchAboutUs from '../views/ChurchAboutUs';
import ChurchContactUs from '../views/ChurchContactUs';
import AppAppBar from '../views/AppAppBar';
import withRoot from '../withRoot';

function Index() {
  return (
    <React.Fragment>
      <AppAppBar />
      <ChurchHero />
      <ChurchValues />
      <ChurchCategories />
      <ChurchAboutUs />
      <ChurchContactUs />
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Index);
