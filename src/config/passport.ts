import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User'

passport.use(
    new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // get email from profile
                const email = profile.emails?.[0].value
                console.log('Passport Strategy - Email:', email)
                console.log('Passport Strategy - Expected Domain:', process.env.ALLOWED_EMAIL_DOMAIN)

                // check if email is valid
                if (!email || !email.endsWith(process.env.ALLOWED_EMAIL_DOMAIN as string)) {
                    console.log('Passport Strategy - Domain mismatch or missing email!')
                    return done(null, false)
                }

                // check if user exists
                let user = await User.findOne({ googleId: profile.id })
                console.log('Utilizador encontrado:', user)

                // if user does not exist, create user
                if (!user) {
                    console.log('Utilizador não encontrado, a criar...')
                    user = await User.create({
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                    role: 'student',
                })
                console.log('Utilizador criado:', user)
                }

                // return user
                return done(null, user)             
            } catch (error) {
                // return error
                console.error('Erro no passport:', error)
                return done(error, false)
            }
        }
    )
)

export default passport