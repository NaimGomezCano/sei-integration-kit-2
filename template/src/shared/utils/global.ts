import { appEnv } from '@/appEnv'

export function getAppWelcomeInfo() {
  let welcome = 'Welcome to Seidor API!'

  switch (appEnv.NODE_ENV) {
    case 'development':
      welcome += ' - 🚧 Development 🚧 '
      break
    case 'test':
      welcome += ' - 🧪 Test 🧪 '
      break
    case 'production':
      welcome += ' - 🚨 Production 🚨 '
      break
    default:
      welcome += ' - 🤷‍♂️ Unknown 🤷‍♂️ '
      break
  }

  const res = {
    service_layer_user: appEnv.SBO_SL_USER,
    service_layer_db: appEnv.SBO_SL_DB_NAME,
    sap_db: appEnv.SBO_DB_NAME,
    sap_db_type: appEnv.SBO_DB_TYPE,
    message: welcome,
  }

  return res
}

export function toPrintable(msg: any, formatted: boolean = true): string {
  if (typeof msg === 'object' || Array.isArray(msg)) {
    if (formatted) {
      return JSON.stringify(msg, null, 2)
    }

    return JSON.stringify(msg)
  }

  return String(msg)
}

export function getValuesFromEnum(enumType: any): string[] {
  return Object.values(enumType) as string[]
}

export const safeJsonParse = <T>(str: string) => {
  try {
    const jsonValue: T = JSON.parse(str)

    return jsonValue
  } catch {
    return undefined
  }
}

type AnyObject = Record<string, any>

function compareObjects(obj1: AnyObject, obj2: AnyObject): boolean {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      const val1 = obj1[key]
      const val2 = obj2[key]

      if (Array.isArray(val2)) {
        if (!Array.isArray(val1) || !compareArrays(val1, val2)) {
          return true // Array mismatch
        }
      } else if (typeof val2 === 'object' && val2 !== null) {
        if (!val1 || typeof val1 !== 'object') {
          return true // Structure mismatch
        }
        if (compareObjects(val1, val2)) {
          return true // Nested difference found
        }
      } else {
        if (val1 != val2) {
          return true // Primitive value mismatch
        }
      }
    }
  }
  return false
}

function compareArrays(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) {
    return false // Different lengths
  }

  for (let i = 0; i < arr2.length; i++) {
    const val1 = arr1[i]
    const val2 = arr2[i]

    if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
      if (compareObjects(val1, val2)) {
        return false // Nested object difference
      }
    } else if (val1 !== val2) {
      return false // Primitive value difference
    }
  }
  return true
}

export function isUpdateNeeded(source: AnyObject, updateBody: AnyObject): boolean {
  return compareObjects(source, updateBody)
}

export function extractNumbers(input: string): number {
  return parseInt(input.replace(/[^0-9]/g, ''))
}

export function nestedArrayDistinct<T>(arr: T[][]): T[][] {
  const result: T[][] = []

  // Find the maximum length among all inner arrays
  const maxLength = Math.max(...arr.map((inner) => inner.length))

  // For each position (up to the max length)
  for (let i = 0; i < maxLength; i++) {
    const newArray: T[] = []

    // For each original inner array
    for (let j = 0; j < arr.length; j++) {
      // Only add if the original array has enough elements at this position
      if (i < arr[j].length) {
        newArray.push(arr[j][0]) // Always push the first element
      }
    }

    result.push(newArray)
  }

  return result
}
