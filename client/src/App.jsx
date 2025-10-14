import { useState } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'
import { Route,Routes, useMatch } from 'react-router-dom'

import CoursesList from './pages/student/CoursesList'
import MyEnrollments from './pages/student/MyEnrollments'
import CourseDetails from './pages/student/CourseDetails'
import HomePage from './pages/student/HomePage'
import VidPlayer from './pages/student/VidPlayer'
import LoadingContent from './components/student/LoadingContent'

import EducatorPage from './pages/educators/EducatorPage'
import EducatorDashboard from './pages/educators/EducatorDashboard'
import EducatorAddCourses from './pages/educators/EducatorAddCourses'
import EducatorStudentsEnrolled from './pages/educators/EducatorStudentsEnrolled'
import EducatorMyCourses from './pages/educators/EducatorMyCourses'
import StudentNavbar from './components/student/StudentNavBar'
import Player from './pages/student/Player'
import "quill/dist/quill.snow.css";

const App = () => {

  const isEducatorRoute = useMatch('/educator/*')
 

  return (
  
      <div>
        {!isEducatorRoute && <StudentNavbar />}
        
        <Routes >
          
          <Route path='/' element={<HomePage />}/>
          <Route path='/course-list' element={<CoursesList />}/>
          <Route path='/course-list/:input' element={<CoursesList />}/>
          <Route path='/my-enrollments' element={<MyEnrollments />}/>
          <Route path='/course/:id' element={<CourseDetails />}/>
          <Route path='/player' element={<videoPlayer />}/>
          <Route path='/player/:courseId' element={<VidPlayer />}/>
          <Route path='/player2/:courseId' element={<Player />}/>
          <Route path='/loading/:path' element={<LoadingContent />}/>

        <Route path='/educator' element={<EducatorPage />}>
            <Route path='/educator' element={<EducatorDashboard />}/>
            <Route path='add-course' element={<EducatorAddCourses />}/>
            <Route path='student-enrolled' element={<EducatorStudentsEnrolled />}/>
            <Route path='my-course' element={<EducatorMyCourses />}/>
          </Route>
          
        </Routes>
      </div>
      
  
  )
}

export default App
