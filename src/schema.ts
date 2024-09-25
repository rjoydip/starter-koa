import { email, maxLength, minLength, nullish, object, pipe, regex, string, uuid } from 'valibot'

/**
 * ${1:Description placeholder}
 *
 * @type {${2:*}}
 */
export const UserSchema = object({
  _id: nullish(pipe(string(), uuid())),
  name: pipe(string(), minLength(8)),
  email: pipe(string(), email()),
  phone: pipe(string(), regex(/^\+(?:[0-9-()/.]\s?){6,15}\d$/)),
  address: pipe(string(), minLength(10), maxLength(50)),
})
