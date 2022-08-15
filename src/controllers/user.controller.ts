import {authenticate, TokenService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {UserService} from '../services/user-service';

const setTokenCookie = (response: Response, token?: String): void => {
  // It's secured as long as CORS is disabled and the API only accepts JSON
  // https://github.com/pillarjs/understanding-csrf
  response.setHeader('set-cookie', [
    `token=${
      token
        ? `${token}; path=/; max-age=${Number(
            TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
          )} ; HttpOnly`
        : ` ; path=/; max-age=0 ; HttpOnly` // reset
    }`,
  ]);
};

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    delete user.createdAt;
    delete user.updatedAt;
    delete user.jwtTokenSalt;
    delete user.resetPasswordJWTTokenSalt;
    // throw new HttpErrors.Unauthorized('unauthorized')
    this.userService.validateCredentials(`${user.email}`, user.password);
    let uniqueness = await this.userRepository.count({
      email: {ilike: user.email},
    });
    if (uniqueness.count > 0) {
      // TODO handle uniqueness at the database level?
      throw new HttpErrors.Unauthorized(
        `User with email ${user.email} already exists.`,
      );
    }
    const password = await this.passwordHasher.hashPassword(user.password);
    if (user.email) {
      // user.confirmationCode = Math.floor(100000 + Math.random() * 899999)
      user.confirmationCode = 89897;
    }
    try {
      const savedUser = await this.userRepository.create(
        new User({...user, password}),
      );
      return savedUser;
      // TO DO perhaps we should allow user creation on first
      // return this.userRepository.create(user)
    } catch (error) {
      throw error;
    }
  }

  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const foundUser = await this.userRepository.findById(id, filter);
    return foundUser;
  }

  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    delete user.createdAt;
    delete user.updatedAt;
    if (id !== Number(currentUserProfile.id)) {
      throw new HttpErrors.Unauthorized('unauthorized');
    }
    await this.userRepository.updateById(id, user);
    return;
  }

  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    throw new HttpErrors.Unauthorized('unauthorized');
    // await this.userRepository.replaceById(id, user)
  }

  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    throw new HttpErrors.Unauthorized('unauthorized');
    // await this.userRepository.deleteById(id)
  }

  @post('/users/login', {
    responses: {
      '204': {
        description: 'User login success',
      },
    },
  })
  async login(
    @requestBody(Object) {login, password}: any,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<any> {
    const user = await this.userService.verifyCredentials(login, password);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    setTokenCookie(response, token);
    return token;
  }

  @get('/users/me', {
    responses: {
      '200': {
        description: 'The current user profile',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    const userId = Number(currentUserProfile[securityId]);
    const foundUser = await this.userRepository.findById(userId);
    return foundUser;
  }

  @post('/users/logout', {
    responses: {
      '204': {
        description: 'User login success',
      },
    },
  })
  async logout(
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<any> {
    setTokenCookie(response);
  }
}
