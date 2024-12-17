import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      fullName: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      country: 'USA',
      role: 'admin',
    })
  }
}
