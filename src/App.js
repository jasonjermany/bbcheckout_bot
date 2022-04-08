import React from "react"
import reportWebVitals from "./reportWebVitals"
import Home from "./components/Home"
import "./App.css"
import ParticleBackground from "./ParticleBackground.js"
import {
    HashRouter,
    Route
  } from "react-router-dom";
  
function App() {
    return (
        <div>
            <reportWebVitals>
                <HashRouter>
                    <div id="menu">
                        <Route exact path="/" component={Home} />
                    </div>
                    <div id="particles">
                        <ParticleBackground />
                    </div>
                </HashRouter>
            </reportWebVitals>
        </div>
    )
}

export default App