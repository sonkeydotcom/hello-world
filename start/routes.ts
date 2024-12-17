/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

import { middleware } from './kernel.js'

const UsersController = () => import('#controllers/users_controller')
const PostsController = () => import('#controllers/posts_controller')
const CommentsController = () => import('#controllers/comments_controller')
const AdminController = () => import('#controllers/admin_controller')

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/login', [UsersController, 'index'])
    router.post('/register', [UsersController, 'create'])
    router.get('/verify-email', [UsersController, 'sendOtp'])
    router.post('/verify-email', [UsersController, 'verifyEmail'])
  })
  .prefix('/api/users')

router
  .group(() => {
    router.get('/', [PostsController, 'index'])
    router.get('/:id', [PostsController, 'show'])
    router.post('/', [PostsController, 'create'])
    router.patch('/:id', [PostsController, 'edit'])
    router.delete('/:id', [PostsController, 'delete'])
    router.post('/:id/comment', [CommentsController, 'create'])
  })
  .prefix('/api/posts')

router
  .group(() => {
    router.get('/', [AdminController, 'index'])
    router.post('/', [AdminController, 'addAdmin'])
  })
  .prefix('/api/admin')
  .use(middleware.admin())
