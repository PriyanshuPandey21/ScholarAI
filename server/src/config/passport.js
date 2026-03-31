import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (err) { done(err, null); }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ provider: 'google', providerId: profile.id });
    if (!user) user = await User.create({
      name: profile.displayName,
      email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
      avatar: profile.photos?.[0]?.value || '',
      provider: 'google', providerId: profile.id,
    });
    done(null, user);
  } catch (err) { done(err, null); }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/auth/github/callback',
  scope: ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ provider: 'github', providerId: String(profile.id) });
    if (!user) user = await User.create({
      name: profile.displayName || profile.username,
      email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
      avatar: profile.photos?.[0]?.value || '',
      provider: 'github', providerId: String(profile.id),
    });
    done(null, user);
  } catch (err) { done(err, null); }
}));
