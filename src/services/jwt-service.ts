import { inject } from '@loopback/context'
import { HttpErrors } from '@loopback/rest'
import { promisify } from 'util'
import { TokenService } from '@loopback/authentication'
import { UserProfile, securityId } from '@loopback/security'
import { repository } from '@loopback/repository'
import { TokenServiceBindings } from '../keys'
import { UserRepository } from '../repositories/user.repository'

const jwt = require('jsonwebtoken')
const signAsync = promisify(jwt.sign)
const verifyAsync = promisify(jwt.verify)

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
    @repository(UserRepository)
    protected userRepository: UserRepository
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: 'token' is null`
      )
    }
    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret)
      const foundUser = await this.userRepository.findById(decryptedToken.id)
      if (!foundUser) {
        throw new HttpErrors.Unauthorized('User not found for this token')
      }
      let userProfile: UserProfile
      userProfile = Object.assign(
        { [securityId]: '', name: '' },
        {
          [securityId]: foundUser.id,
          name: foundUser.login,
          id: foundUser.id,
          email: foundUser.email
        }
      )
      return userProfile
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: ${error.message}`
      )
    }
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token: userProfile is null'
      )
    }
    let token: string
    try {
      token = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn)
      })
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token: ${error}`)
    }
    return token
  }
}
