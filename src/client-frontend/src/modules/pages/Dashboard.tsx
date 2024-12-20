import React from 'react'
import AppAppBar from '../views/AppAppBar'
import AppFooter from '../views/AppFooter'
import withRoot from '../withRoot'

function Dashboard() {
  return (
    <React.Fragment>
      <AppAppBar />
      <div>Coming Soon</div>
      <AppFooter />
    </React.Fragment>
  )
}

export default withRoot(Dashboard)