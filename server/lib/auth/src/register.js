import * as EmailValidator from 'email-validator';
import jsonwebtoken from 'jsonwebtoken';

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @param {String} url
 * @param {import("mongoose").Model} User
 */
export const useRegisterRoute = (User, url = '/api/auth/register') => {
  /**
   * @type {import('fastify').RouteShorthandOptions}
   * @const
   */
  const opts = {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: {type: 'string', minLength: 1},
          password: {type: 'string', minLength: 8},
          email: {type: 'string'},
        },
        required: ['username', 'email', 'password'],
      },
    },
  };

  // eslint-disable-next-line valid-jsdoc
  /**
   * @param {import('fastify').FastifyInstance} fastify
   */
  const registerRoutes = async (fastify) => {
    fastify.post(url, opts, async (request, reply) => {
      const {username, email, password} = request.body;

      if (!EmailValidator.validate(email)) {
        return {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Email is incorrect',
        };
      }

      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

      if (!password.match(passwordRegex)) {
        return {
          statusCode: 400,
          error: 'Bad Request',
          message:
            'Password must containing at least ' +
            '8 characters, 1 number, 1 upper and 1 lowercase',
        };
      }

      const user = new User({
        username,
        email,
        password,
      });

      try {
        await user.save();
      } catch (e) {
        if (e.code === 11000) {
          return {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Email and username must be unique',
          };
        }
      }

      const userId = user.id.toString();

      const token = jsonwebtoken.sign({
        userId,
      }, process.env.JWT_SECRET || 'secret key');

      return {
        token,
        userId,
      };
    });
  };

  return {registerRoutes};
};
