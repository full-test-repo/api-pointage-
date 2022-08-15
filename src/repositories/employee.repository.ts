import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ApiPointageDataSource} from '../datasources';
import {Employee, EmployeeRelations} from '../models';

export class EmployeeRepository extends DefaultCrudRepository<
  Employee,
  typeof Employee.prototype.id,
  EmployeeRelations
> {
  constructor(
    @inject('datasources.api_pointage') dataSource: ApiPointageDataSource,
  ) {
    super(Employee, dataSource);
  }
}
