import Home from "./Home"
import { Routes } from "react-router-dom"
import { Route } from "react-router"

function App() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    </div>
  )
}

export default App