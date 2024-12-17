import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      await ctx.auth.authenticate()

      const user = ctx.auth.user

      console.log('Authenticated User:', user)

      if (!user) {
        return ctx.response.unauthorized({
          message: 'Authentication required',
        })
      }

      if (user.role !== 'admin') {
        return ctx.response.forbidden({
          message: 'Access denied. Admin privileges required.',
        })
      }

      return next()
    } catch (error) {
      console.error('Admin Middleware Error:', error)

      if (error.code === 'E_INVALID_AUTH_TOKEN') {
        return ctx.response.unauthorized({
          message: 'Invalid or expired authentication token',
        })
      }

      return ctx.response.unauthorized({
        message: 'Authentication failed',
        error: error.message,
      })
    }
  }
}
