import { COMMAND, KEYWORD, LIST, NUMBER, STRING, VAR } from "./objectTypes"

export const createNumber = (value) => ({ type: NUMBER, element: value, repr: `${value}` })
export const createString = (value) => ({ type: STRING, element: value, repr: `"${value}"` })
export const createCommand = (name, value) => ({ type: COMMAND, element: value, repr: `COMMAND<${value}>`, name })
export const createVar = (name) => ({ type: VAR, element: name, repr: `'${name}'`, name })
export const createList = (objects) => ({ type: LIST, element: objects, repr: `{ ${objects.map((object) => object.repr).join(" ")} }` })
export const dupObject = (object) => ({ ...object })
export const createKeyword = (name, value) => ({ type: KEYWORD, element: value, repr: name, name })
