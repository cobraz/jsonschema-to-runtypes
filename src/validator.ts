import {JSONSchema} from './types/JSONSchema'
import {mapDeep} from './utils'

type Rule = (schema: JSONSchema) => boolean | void
const rules = new Map<string, Rule>()

rules.set('Enum members and tsEnumNames must be of the same length', schema => {
  if (schema.enum && schema.tsEnumNames && schema.enum.length !== schema.tsEnumNames.length) {
    return false
  }
  return undefined;
})

rules.set('tsEnumNames must be an array of strings', schema => {
  if (schema.tsEnumNames && schema.tsEnumNames.some(_ => typeof _ !== 'string')) {
    return false
  }
  return undefined;
})

rules.set('When both maxItems and minItems are present, maxItems >= minItems', schema => {
  const {maxItems, minItems} = schema
  if (typeof maxItems === 'number' && typeof minItems === 'number') {
    return maxItems >= minItems
  }
  return undefined;
})

rules.set('When maxItems exists, maxItems >= 0', schema => {
  const {maxItems} = schema
  if (typeof maxItems === 'number') {
    return maxItems >= 0
  }
  return undefined;
})

rules.set('When minItems exists, minItems >= 0', schema => {
  const {minItems} = schema
  if (typeof minItems === 'number') {
    return minItems >= 0
  }
  return undefined;
})

export function validate(schema: JSONSchema, filename: string): string[] {
  const errors: string[] = []
  rules.forEach((rule, ruleName) => {
    mapDeep(schema, (schema, key) => {
      if (rule(schema) === false) {
        errors.push(`Error at key "${key}" in file "${filename}": ${ruleName}`)
      }
      return schema
    })
  })
  return errors
}
