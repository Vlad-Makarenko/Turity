// import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @param {String} url
 * @param {import("mongoose").Model} User
 * @param {import("mongoose").Model} Restore
 */
export const useRestoreRoute = (User, Restore, url = '/api/auth/restore') => {
  /**
   * @type {import('fastify').RouteShorthandOptions}
   * @const
   */
  const restorePostOpts = {
    schema: {
      body: {
        type: 'object',
        properties: {
          userIdentifier: {type: 'string', minLength: 1},
        },
        required: ['userIdentifier'],
      },
    },
  };
  /**
   * @type {import('fastify').RouteShorthandOptions}
   * @const
   */
  const restoreHashGetOpts = {
    maxParamLength: 1000,
  };

  const restoreHashPostOpts = {
    schema: {
      body: {
        type: 'object',
        properties: {
          newPassword: {type: 'string', minLength: 8},
          newPasswordRepeat: {type: 'string', minLength: 8},
        },
        required: ['newPassword', 'newPasswordRepeat'],
      },
    },
  };

  const restoreRoutes = async (fastify) => {
    fastify.post(url, restorePostOpts, async (request, reply) => {
      const {userIdentifier} = request.body;

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

      let restore = await Restore.findOne({
        user_id: user.id.toString(),
      });

      if (restore) {
        return {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Check your email on restore link',
        };
      }

      const hash = crypto
          .createHash('sha256', process.env.RESTORE_SECRET || 'restore secret')
          .update(user.id.toString() + Date.now().toString())
          .digest('hex');

      restore = new Restore({
        user_id: user.id.toString(),
        hash,
      });

      await restore.save();

      // send email

      return {
        statusCode: 200,
        message: 'Check your email',
      };
    });

    fastify.get(url + '/:hash', restoreHashGetOpts, async (request, reply) => {
      const {hash} = request.params;

      const restore = await Restore.findOne({
        hash: hash,
      });

      if (!restore) {
        return false;
      }

      return true;
    });

    fastify.post(
        url + '/:hash',
        restoreHashPostOpts,
        async (request, reply) => {
          const hash = request.params.hash;

          const restore = await Restore.findOne({
            hash: hash,
          });

          if (!restore) {
            return {
              statusCode: 404,
              error: 'Not Found',
              message: 'Invalid link',
            };
          }

          const {newPassword, newPasswordRepeat} = request.body;

          if (newPassword !== newPasswordRepeat) {
            return {
              statusCode: 400,
              error: 'Bad Request',
              message: 'Passwords do not match',
            };
          }

          const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

          if (!newPassword.match(passwordRegex)) {
            return {
              statusCode: 400,
              error: 'Bad Request',
              message:
              'Password must containing at least ' +
              '8 characters, 1 number, 1 upper and 1 lowercase',
            };
          }

          const user = await User.findById(restore.user_id);

          if (!user) {
            return {
              statusCode: 404,
              error: 'Not Found',
              message: 'User not found',
            };
          }

          const hashedPassword = await bcrypt.hash(
              newPassword,
              process.env.SALT || 10,
          );

          user.password = hashedPassword;

          await user.save();
          restore.delete();

          // send email
          return {
            statusCode: 200,
            error: 'OK',
            message: 'Password was changed',
          };
        },
    );
  };

  return {restoreRoutes};
};
