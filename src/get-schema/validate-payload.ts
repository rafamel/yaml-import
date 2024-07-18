import type { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';

import type { Payload } from './definitions';

const schema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  required: ['paths'],
  properties: {
    paths: {
      oneOf: [
        { type: 'string', minLength: 1 },
        { type: 'array', minItems: 1, items: { type: 'string', minLength: 1 } }
      ]
    },
    strategy: {
      type: 'string',
      enum: ['sequence', 'shallow', 'merge', 'deep']
    },
    data: {},
    recursive: { type: 'boolean' }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

export function validatePayload(payload: Payload): boolean {
  return validate(payload) as boolean;
}
