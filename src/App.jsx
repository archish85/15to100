import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import GameBoard from './components/GameBoard'
import { useGameStore } from './store/gameStore'

import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const initGame = useGameStore((state) => state.initGame)

  useEffect(() => {
    initGame()
  }, [initGame])

  return (
    <Router>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<GameBoard />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  )
}

export default App
