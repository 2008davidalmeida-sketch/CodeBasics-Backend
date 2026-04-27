import { Router } from 'express'
import passport from '../config/passport'
import { handleGoogleCallback, getMe, logout } from '../controllers/authController'

const router = Router()

// redirect to Google login page
const redirectToGoogle = passport.authenticate('google', { 
    scope: ['profile', 'email'] 
})

//  process the response from Google
const processGoogleCallback = passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=unauthorized` 
})

// get current user info
router.get('/google', redirectToGoogle)

// handle Google callback and redirect to client with token
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.CLIENT_URL}/login?error=unauthorized`
        })(req, res, next)
    },
    handleGoogleCallback
)

// Get current user route
router.get('/me', getMe)

// Logout route
router.post('/logout', logout)

export default router