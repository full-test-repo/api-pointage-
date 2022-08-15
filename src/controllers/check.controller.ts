import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Check} from '../models';
import {CheckRepository} from '../repositories';

export class CheckController {
  constructor(
    @repository(CheckRepository)
    public checkRepository: CheckRepository,
  ) {}

  @post('/checks/{emplyee_id}')
  @response(200, {
    description: 'Check model instance',
    content: {'application/json': {schema: getModelSchemaRef(Check)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Check, {
            title: 'NewCheck',
            exclude: ['id'],
          }),
        },
      },
    })
    @param.path.number('emplyee_id')
    emplyeeId: number,
    check: Omit<Check, 'id'>,
  ): Promise<Check> {
    return this.checkRepository.create({
      ...check,
      eployeeId: emplyeeId,
    });
  }

  @get('/checks/count')
  @response(200, {
    description: 'Check model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Check) where?: Where<Check>): Promise<Count> {
    return this.checkRepository.count(where);
  }

  @get('/checks')
  @response(200, {
    description: 'Array of Check model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Check, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Check) filter?: Filter<Check>): Promise<Check[]> {
    return this.checkRepository.find(filter);
  }

  @get('/checks/{id}')
  @response(200, {
    description: 'Check model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Check, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Check, {exclude: 'where'})
    filter?: FilterExcludingWhere<Check>,
  ): Promise<Check> {
    return this.checkRepository.findById(id, filter);
  }

  @patch('/checks/{id}')
  @response(204, {
    description: 'Check PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Check, {partial: true}),
        },
      },
    })
    check: Check,
  ): Promise<void> {
    await this.checkRepository.updateById(id, check);
  }

  @put('/checks/{id}')
  @response(204, {
    description: 'Check PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() check: Check,
  ): Promise<void> {
    await this.checkRepository.replaceById(id, check);
  }

  @del('/checks/{id}')
  @response(204, {
    description: 'Check DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.checkRepository.deleteById(id);
  }
}
