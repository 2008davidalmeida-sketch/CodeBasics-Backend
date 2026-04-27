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
            console.log('Passport strategy running')
            try {
                // get email from profile
                const email = profile.emails?.[0].value
                console.log('Email:', email)
                console.log('Domain check:', email?.endsWith(process.env.ALLOWED_EMAIL_DOMAIN as string))
                console.log('ALLOWED_EMAIL_DOMAIN:', process.env.ALLOWED_EMAIL_DOMAIN)

                // check if email is valid
                if (!email || !email.endsWith(process.env.ALLOWED_EMAIL_DOMAIN as string)) {
                    return done(null, false)
                }

                // get photo from profile
                const photo = profile.photos?.[0].value

                // check if user exists
                let user = await User.findOne({ googleId: profile.id })

                if (user) {
                    // Update photo if it has changed
                    if (user.photo !== photo) {
                        user.photo = photo
                        await user.save()
                    }
                } else {
                    // create user
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        photo,
                        googleId: profile.id,
                        role: 'student',
                    })
                }

                // return user
                return done(null, user)
            } catch (error) {
                // return error
                return done(error, false)
            }
        }
    )
)

export default passport