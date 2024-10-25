import type { Driver, Storage } from 'unstorage'
import { createStorage } from 'unstorage'

export function defineCache(driver: Driver): Storage {
  return createStorage({
    driver,
  })
}
