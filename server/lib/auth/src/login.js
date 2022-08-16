import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @param {String} url
 * @param {import("mongoose").Model} User
 */
export const useLoginRoute = (User, url = '/api/auth/login') => {
  /**
   * @type {import('fastify').RouteShorthandOptions}
   * @const
   */
  const opts = {
    schema: {
      body: {
        type: 'object',
        properties: {
          userIdentifier: {type: 'string', minLength: 1},
          password: {type: 'string', minLength: 8},
        },
        required: ['userIdentifier', 'password'],
      },
    },
  };

  // eslint-disable-next-line valid-jsdoc
  /**
   * @param {import('fastify').FastifyInstance} fastify
   */
  const loginRoutes = async (fastify) => {
    fastify.post(url, opts, async (request, reply) => {
      const {userIdentifier, password} = request.body;

      const user = await User.findOne({
        $or: [{username: userIdentifier}, {email: userIdentifier}],
      });

      if (!user) {
        return {
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        };
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return {
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        };
      }

      const userId = user.id.toString();

      const token = jwt.sign(
          {
            userId,
          },
          process.env.JWT_SECRET || 'secret key',
      );

      return {
        token,
        userId,
      };
    });
  };

  return {loginRoutes};
};
