import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { COOKIE_NAME } from "../constants";

import { User } from "../entities/User";
import { MyContext } from "../types";

@ObjectType()
class LoginError {
  @Field(() => String)
  field!: string;

  @Field(() => String)
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [LoginError], { nullable: true })
  errors?: LoginError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    const userId = req.session.userId;

    if (!userId) {
      return null;
    }

    return await em.findOne(User, { id: userId });
  }

  @Query(() => [User])
  async users(@Ctx() { em }: MyContext) {
    return await em.find(User, {});
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = em.create(User, { username, password: hashedPassword });

    try {
      await em.persistAndFlush(newUser);
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: `user ${username} already exists`,
            },
          ],
        };
      }
    }

    // auto login after register
    req.session.userId = newUser.id;

    return { user: newUser };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });

    if (!user) {
      return {
        errors: [
          { field: "username", message: "that username doesn't exists" },
        ],
      };
    }

    const passwordIsValid = await argon2.verify(user.password, password);

    if (!passwordIsValid) {
      return {
        errors: [{ field: "password", message: "password is invalid" }],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    res.clearCookie(COOKIE_NAME);

    return await new Promise((resolve) => {
      req.session.destroy((err) => {
        err ? resolve(false) : resolve(true);
      });
    });
  }
}
