import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ApiPointageDataSource} from '../datasources';
import {Check, CheckRelations} from '../models';

export class CheckRepository extends DefaultCrudRepository<
  Check,
  typeof Check.prototype.id,
  CheckRelations
> {
  constructor(
    @inject('datasources.api_pointage') dataSource: ApiPointageDataSource,
  ) {
    super(Check, dataSource);
  }
}
