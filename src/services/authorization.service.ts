import {Getter, inject} from '@loopback/context';
import {bind, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {EmployeeRepository} from '../repositories';

@bind({scope: BindingScope.TRANSIENT})
export class AuthorizationService {
  constructor(
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
    @inject.getter(SecurityBindings.USER, {optional: true})
    public getCurrentUser: Getter<UserProfile>,
  ) {}

  async authorize(
    type: string,
    id: number,
    action: 'read' | 'create' | 'update' | 'delete' = 'read',
  ): Promise<void> {
    if (type === 'App' && action === 'read') {
      return;
    }

    const currentUser = await this.getCurrentUser();
    if (action !== 'read' && !currentUser) {
      throw new HttpErrors.Unauthorized('unauthorized');
    } else if (action !== 'read' && type === 'App' && !currentUser) {
      throw new HttpErrors.Unauthorized('unauthorized');
    }

    const repository = this.repositoryFromType(type);
    const foundEntity = await repository.findById(id);

    if (!foundEntity) {
      throw new HttpErrors.NotFound(`${type} with id: ${id} not found.`);
    }
  }

  repositoryFromType(type: string): any {
    return this.employeeRepository;
  }
}
