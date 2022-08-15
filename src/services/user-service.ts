import {Getter, inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';

import {PasswordHasherBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {PasswordHasher} from './hash.password.bcryptjs';

export class UserService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject.getter(SecurityBindings.USER, {optional: true})
    public getCurrentUser: Getter<UserProfile>,
  ) {}

  validateCredentials(login: string, password: string) {
    if (!login || !password) {
      throw new HttpErrors.UnprocessableEntity(
        'login and password are required.',
      );
    }
  }

  async verifyCredentials(login: string, password: string): Promise<User> {
    this.validateCredentials(login, password);

    const foundUser = await this.userRepository.findOne({
      where: {or: [{login}, {email: login}]},
    });

    if (!foundUser) {
      throw new HttpErrors.NotFound(`User ${login} not found.`);
    }
    const passwordMatched = await this.passwordHasher.comparePassword(
      password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('The credentials are not correct.');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      name: user.login,
      [securityId]: user.id + '_id',
    };
  }
}
