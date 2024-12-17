import path from 'node:path'
import url from 'node:url'

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../', // for AdonisJS v6
  info: {
    title: 'AdonisJS REST API',
    version: '1.0.0',
    description: 'API documentation for AdonisJS backend',
  },
  tagIndex: 2,
  servers: [
    {
      url: 'http://localhost:3333', // Add the protocol (http/https)
      description: 'Local development server',
    },
  ],
  snakeCase: true,
  debug: true, // Enable debug mode to diagnose issues
  ignore: ['/swagger', '/docs'], // Exclude swagger routes
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {},
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  showFullPath: true,
}
