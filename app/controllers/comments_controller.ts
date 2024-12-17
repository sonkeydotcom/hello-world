import Comment from '#models/comment'
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async index({ response, params }: HttpContext) {
    const post = await Post.findBy('id', params.id)
    if (!post) {
      throw new Error('Post not found')
    }
    try {
      const comments = await post.related('Comments').query()
      return response.send(comments)
    } catch (error) {
      response.badRequest({
        message: error.message,
      })
    }
  }

  async create({ request, response, auth, params }: HttpContext) {
    const user = await auth.authenticate()
    const { content } = request.only(['content'])
    const post = await Post.findBy('id', params.id)
    if (!post) {
      throw new Error('Post not found')
    }
    try {
      const comment = await Comment.create({ content, userId: user.id, postId: post.id })
      return response.created(comment)
    } catch (error) {
      response.badRequest({
        message: error.message,
      })
    }
  }
}
