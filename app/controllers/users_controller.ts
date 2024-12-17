// app/controllers/users_controller.ts

import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

export default class UsersController {
  async index({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    try {
      // Log incoming request
      logger.info('User attempting to log in', { email })

      if (!email || !password) {
        throw new Error('Missing email or password')
      }

      const user = await User.verifyCredentials(email, password)
      if (!user) {
        // Log invalid credentials
        logger.warn('Invalid login attempt', { email })
        throw new Error('Invalid credentials')
      }

      const token = await User.accessTokens.create(user)

      // Log successful login
      logger.info('User logged in successfully', { userId: user.id })

      return response.json({
        status: 200,
        message: 'Logged in successfully',
        user: {
          ...user.toJSON(),
          token: token.value!.release(),
        },
      })
    } catch (error) {
      // Log the error
      logger.error('Error during login', { error: error.message, email })

      return response.badRequest({
        message: error.message,
      })
    }
  }

  async create({ request, response }: HttpContext) {
    const { fullName, country, email, password } = request.only([
      'fullName',
      'country',
      'email',
      'password',
    ])

    try {
      // Log user creation request
      logger.info('Creating a new user', { email, country })

      if (!fullName || !country || !email || !password) {
        throw new Error('Missing required fields')
      }

      const existing = await User.findBy('email', email)

      if (existing) {
        logger.warn('Attempt to create a duplicate user', { email })
        throw new Error('User already exists')
      }

      const otp = Math.floor(100000 + Math.random() * 900000)

      const otpExpiresAt = DateTime.now().plus({ minutes: 5 })

      const user = await User.create({
        fullName,
        country,
        email,
        password,
        otp,
        otpExpiresAt,
      })

      const mailer = await mail.send((message) => {
        message
          .to(email)
          .from('annagu.kennedy@gmail.com')
          .subject('Verify your email address')
          .text(`Your verification code is: ${otp}`)
      })

      if (!mailer) {
        logger.error('Failed to send verification email', { email })
        throw new Error('Failed to send verification email')
      }

      logger.info('User created successfully', { userId: user.id })
      logger.info('Verification email sent to', { email })

      return response.ok({
        status: 201,
        message: 'User created successfully',
        user,
      })
    } catch (error) {
      logger.error('Error during user creation', { error: error.message, email })

      return response.badRequest({
        status: error.status,
        message: error.message,
      })
    }
  }

  async sendOtp({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    const user = await User.findBy('email', email)

    const otp = Math.floor(100000 + Math.random() * 900000)

    const otpExpiresAt = DateTime.now().plus({ minutes: 5 })

    try {
      if (!email) {
        throw new Error(' Missing email address')
      }

      if (!user) {
        throw new Error('User not found')
      }

      user.otp = otp
      user.otpExpiresAt = otpExpiresAt
      await mail.send((message) => {
        message
          .to(email)
          .from('annagu.kennedy@gmail.com')
          .subject('Verify your email address')
          .text(`Your verification code is: ${otp}`)
      })
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }

  async verifyEmail({ request, response }: HttpContext) {
    const { otp, email } = request.only(['otp', 'email'])
    try {
      const user = await User.findBy('email', email)

      if (!user) {
        throw new Error(`User with email, ${email} does not exit`)
      }
      if (!otp) {
        throw new Error('Missing OTP')
      }

      if (otp.length < 6) {
        throw new Error('OTP must be six digits')
      }

      if (!user.otpExpiresAt) {
        throw new Error('OTP expiration time is invalid')
      }

      if (DateTime.now().diff(user.otpExpiresAt).as('minutes') > 5) {
        throw new Error('OTP expired')
      }

      if (otp !== user.otp) {
        throw new Error('Invalid OTP')
      }
      user.isVerified = true
      await user.save()
      return response.ok({
        status: 200,
        message: 'Email verified successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }
}
