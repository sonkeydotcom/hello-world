import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  async index({ response, auth }: HttpContext) {
    const admin = await auth.authenticate()
    return response.ok(admin)
  }

  async addAdmin({ response, auth, request }: HttpContext) {
    const admin = auth.authenticate()

    const { fullName, country, email, password } = request.only([
      'fullName',
      'country',
      'email',
      'password',
    ])

    try {
      if (!admin) {
        throw new Error(' You are not authrorised to perform this')
      }

      const newAdmin = await User.create({
        fullName,
        country,
        email,
        password,
        role: 'admin',
      })
      return response.created(newAdmin)
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }
}
