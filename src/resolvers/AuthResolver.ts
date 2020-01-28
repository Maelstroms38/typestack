import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { User } from '../entity/User';
import { AuthInput } from '../graphql-types/AuthInput';
import { UserResponse } from '../graphql-types/UserResponse';
import { Request, Response } from 'express';

const invalidLoginResponse = {
  errors: [
    {
      path: 'email',
      message: 'invalid login'
    }
  ]
};

@Resolver()
export class AuthResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('input')
    { email, username, password }: AuthInput
  ): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          errors: [
            {
              path: 'email',
              message: 'already in use'
            }
          ]
        };
      }
    }
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return {
          errors: [
            {
              path: 'username',
              message: 'already in use'
            }
          ]
        };
      }
    }

    const user = await User.create({
      email,
      username,
      password: hashedPassword
    }).save();

    const token = jwt.sign(
      user,
      process.env.SESSION_SECRET || 'aslkdfjoiq12312'
    );

    return { user, token };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('input') { username, email, password }: AuthInput,
    @Ctx() ctx: { req: Request; res: Response }
  ): Promise<UserResponse> {
    if (username || email) {
      const user = username
        ? await User.findOne({ where: { username } })
        : await User.findOne({ where: { email } });

      if (!user) {
        return invalidLoginResponse;
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return invalidLoginResponse;
      }

      ctx.req.session!.userId = user.id;

      const token = jwt.sign(
        user,
        process.env.SESSION_SECRET || 'aslkdfjoiq12312'
      );

      return { user, token };
    }
    return invalidLoginResponse;
  }
}
