import { Router } from 'express'
import passport from '../config/passport'
import { handleGoogleCallback, getMe, logout } from '../controllers/authController'

const router = Router()

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google OAuth callback routes
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=unauthorized` }),
  handleGoogleCallback
)

// Get current user route
router.get('/me', getMe)

// Logout route
router.post('/logout', logout)

export default router