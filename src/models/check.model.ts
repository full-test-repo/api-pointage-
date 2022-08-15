import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from './user.model';

@model({settings: {strict: false}})
export class Check extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'boolean',
    required: true,
  })
  checkin: boolean;

  @property({
    type: 'date',
  })
  date?: string;

  @belongsTo(() => User)
  eployeeId: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Check>) {
    super(data);
  }
}

export interface CheckRelations {
  // describe navigational properties here
}

export type CheckWithRelations = Check & CheckRelations;
