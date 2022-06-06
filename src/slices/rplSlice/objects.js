import { COMMAND, KEYWORD, LIST, NUMBER, STRING, VAR, PROGRAM, IFTHENELSEEND, VARCALL, FRACTION, COMPLEX } from "./objectTypes"
import { compute_pgcd, getSign } from "./utils"

export const createNumber = (value) => ({ type: NUMBER, element: value, repr: `${value}` })
export const createString = (value) => ({ type: STRING, element: value, repr: `"${value}"` })
export const createCommand = (name, value) => ({ type: COMMAND, element: name, repr: name, name })
export const createVar = (name) => ({ type: VAR, element: name, repr: `'${name}'`, name })
export const createVarCall = (name) => ({ type: VARCALL, element: name, repr: `${name}`, name })
export const createList = (objects) => ({ type: LIST, element: objects, repr: `{ ${objects.map((object) => object.repr).join(" ")} }` })
export const dupObject = (object) => ({ ...object })
export const createKeyword = (name, value) => ({ type: KEYWORD, element: value, repr: name, name })
export const createProgram = (objects) => ({ type: PROGRAM, element: objects, repr: `<< ${objects.map((object) => object.repr).join(" ")} >>` })
export const createIfThenElseEnd = (objects_if, objects_then, objects_else) => ({ type: IFTHENELSEEND, element: { objects_if, objects_then, objects_else }, repr: `if ${objects_if.map((object) => object.repr).join(" ")} then ${objects_then.map((object) => object.repr).join(" ")}${objects_else ? " else " : ""}${objects_else ? objects_else.map((object) => object.repr).join(" ") : ""} end` })
export const createFraction = (num, den) => {
    const pgcd = compute_pgcd(num.element, den.element)
    if (pgcd !== 1) {
        num = createNumber(num.element / pgcd)
        den = createNumber(den.element / pgcd)
    }
    if (den.element < 0) {
        num = createNumber(-num.element)
        den = createNumber(-den.element)
    }
    return { type: FRACTION, element: { num, den }, repr: `${num.repr}/${den.repr}` }
}
export const createComplex = (re, im) => {
    return { type: COMPLEX, element: { re, im }, repr: `${re.repr}${getSign(im) >= 0 ? '+' : ''}${im.repr}i` }
}


