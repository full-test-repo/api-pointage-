import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'api_pointage',
  connector: 'memory',
  localStorage: '',
  file: ''
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ApiPointageDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'api_pointage';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.api_pointage', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
