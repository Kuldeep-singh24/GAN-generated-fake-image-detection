import React from 'react'
import HomePage from './components/HomePage'
import AboutUs from './components/AboutUs'
import Datasets from './components/Datasets'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'

const router  = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {path: '/about', element: <AboutUs /> },
  {path:'/datasets', element: <Datasets/>},
])

const App = () => {
  return (
  <>
  <RouterProvider router={router} />
  </>
  )
}

export default App