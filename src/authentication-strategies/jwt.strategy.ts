import {
  asAuthStrategy,
  AuthenticationStrategy,
  AuthenticationMetadata,
  AuthenticationBindings,
  TokenService
} from '@loopback/authentication'
import { bind, inject } from '@loopback/context'
import {
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec
} from '@loopback/openapi-v3'
import { HttpErrors, Request } from '@loopback/rest'
import { UserProfile } from '@loopback/security'
import { TokenServiceBindings } from '../keys'

@bind(asAuthStrategy, asSpecEnhancer)
export class JWTAuthenticationStrategy
  implements AuthenticationStrategy, OASEnhancer {
  name = 'jwt'

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const throwError =
      !this.metadata ||
      !this.metadata.options ||
      (this.metadata.options as any).throwError !== false
    try {
      const token: string | undefined = this.extractCredentials(
        request,
        throwError
      )
      if (token) {
        const userProfile: UserProfile = await this.tokenService.verifyToken(
          token
        )
        return userProfile
      }
    } catch (e) {
      if (throwError) {
        Object.assign(e, {
          code: 'INVALID_AUTH_TOKEN',
          statusCode: 401
        })
        throw e
      }
    }
    return undefined
  }

  extractCredentials(
    request: Request,
    throwError: boolean
  ): string | undefined {
    let cookieToken =
      request.headers.cookie &&
      request.headers.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
    let token = cookieToken
      ? `Bearer ${cookieToken}`
      : request.headers.authorization
    if (throwError && !token) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`)
    }
    if (token && throwError && !token.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`
      )
    }
    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    const parts = token ? token.split(' ') : null
    if (throwError && (!parts || parts.length !== 2))
      throw new HttpErrors.Unauthorized(
        `Incorrect Authorization header format.`
      )
    return parts && parts.length === 2 ? parts[1] : undefined
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    })
  }
}
