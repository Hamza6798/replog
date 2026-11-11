import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import Exercises from './pages/Exercises.jsx'
import ExerciseDetail from './pages/ExerciseDetail.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Profile from './pages/Profile.jsx'
import Workouts from './pages/Workouts.jsx'
import WorkoutBuilder from './pages/WorkoutBuilder.jsx'
import Programs from './pages/Programs.jsx'
import ProgramGenerator from './pages/ProgramGenerator.jsx'
import ProgramEditor from './pages/ProgramEditor.jsx'
import Collections from './pages/Collections.jsx'
import CollectionDetail from './pages/CollectionDetail.jsx'
import ApiDocs from './pages/ApiDocs.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Exercises />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="exercises/:id" element={<ExerciseDetail />} />
        <Route path="workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="workout-builder" element={<ProtectedRoute><WorkoutBuilder /></ProtectedRoute>} />
        <Route path="workout-builder/:id" element={<ProtectedRoute><WorkoutBuilder /></ProtectedRoute>} />
        <Route path="programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
        <Route path="programs/new" element={<ProtectedRoute><ProgramEditor /></ProtectedRoute>} />
        <Route path="programs/:id" element={<ProtectedRoute><ProgramEditor /></ProtectedRoute>} />
        <Route path="program-generator" element={<ProtectedRoute><ProgramGenerator /></ProtectedRoute>} />
        <Route path="collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
        <Route path="collections/:id" element={<ProtectedRoute><CollectionDetail /></ProtectedRoute>} />
        <Route path="api" element={<ApiDocs />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<ComingSoon title="Page not found" text="That page does not exist." />} />
      </Route>
    </Routes>
  )
}
