import {TokenService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {AuthorizationService} from './services';
import {PasswordHasher} from './services/hash.password.bcryptjs';
import {UserService} from './services/user-service';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = '0TvEDzu*S)cC4[<:|6SrB1G+U8yjom';
  export const TOKEN_EXPIRES_IN_VALUE = String(60 * 60 * 24 * 7);
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER =
    BindingKey.create<PasswordHasher>('services.hasher');
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService>(
    'services.user.service',
  );
}

export namespace AuthorizationBindings {
  export const AUTHORIZATION_SERVICE = BindingKey.create<AuthorizationService>(
    'service.authorization.service',
  );
}
