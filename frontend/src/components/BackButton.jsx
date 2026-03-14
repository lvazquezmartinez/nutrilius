import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const resolveDefaultTarget = (pathname) => {
  if (pathname.startsWith('/patients/') || pathname.startsWith('/patients/new')) {
    return '/patients'
  }
  if (pathname.startsWith('/patients')) {
    return '/dashboard'
  }
  return '/dashboard'
}

export default function BackButton({ label = 'Volver', to }) {
  const navigate = useNavigate()
  const location = useLocation()
  const target = to || resolveDefaultTarget(location.pathname)
  return (
    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(target)} variant="outlined" sx={{ mb: 2 }}>
      {label}
    </Button>
  )
}
