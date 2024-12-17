import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ response }: HttpContext) {
    try {
      const posts = await Post.all()

      if (posts.length === 0) {
        throw new Error('No posts found')
      }

      return response.json(posts)
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }

  async show({ response, params }: HttpContext) {
    const post = await Post.query().where('id', params.id).preload('Comments').first()

    try {
      if (!post) {
        throw new Error('Post not found')
      }

      return response.json(post)
    } catch (error) {
      response.badRequest({})
    }
  }

  async create({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()

    const { title, content } = request.only(['title', 'content'])

    if (!title || !content) {
      return response.badRequest({
        message: 'Missing title or content',
      })
    }

    try {
      const post = await Post.create({ title, content, userId: user.id })
      return response.created(post)
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }

  async edit({ params, request, response, auth }: HttpContext) {
    const user = await auth.authenticate()

    const { title, content } = request.only(['title', 'content'])

    if (!title || !content) {
      return response.badRequest({
        message: 'Missing title or content',
      })
    }

    const post = await Post.find(params.id)

    if (!post) {
      return response.notFound({
        message: 'Post not found',
      })
    }

    if (post.userId !== user.id) {
      return response.forbidden({
        message: 'Unauthorized to edit this post',
      })
    }
    try {
      const updatedPost = await post.merge({ title, content }).save()

      return response.json(updatedPost)
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }

  async delete({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const post = await Post.find(params.id)

    if (!post) {
      return response.notFound({
        message: 'Post not found',
      })
    }

    if (post.userId !== user.id) {
      return response.forbidden({
        message: 'Unauthorized to delete this post',
      })
    }

    try {
      await post.delete()
      return response.ok({
        message: 'Post deleted successfully',
      })
    } catch (error) {
      return response.badRequest({
        message: error.message,
      })
    }
  }
}
