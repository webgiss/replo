import exportOnWindow from "../../tools/exportOnWindow";
import { createFraction, createNumber, createString } from "./objects";
import { FRACTION, NUMBER, STRING } from "./objectTypes";

export const neg = (object) => {
    if (object.type === NUMBER) {
        return createNumber(-object.element)
    }
    if (object.type === FRACTION) {
        return createFraction(neg(object.element.num), object.element.den)
    }
    throw new Error(`Don't know how to neg type ${object.type}`)
}

export const inv = (object) => {
    if (object.type === NUMBER) {
        return createNumber(1 / object.element)
    }
    if (object.type === FRACTION) {
        return createFraction(object.element.den, object.element.num)
    }
    throw new Error(`Don't know how to invert type ${object.type}`)
}

export const add = (object1, object2) => {
    if (object1.type === STRING && object2.type === STRING) {
        return createString(object1.element + object2.element)
    }
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't add types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === NUMBER && object2.type === NUMBER) {
        return createNumber(object1.element + object2.element)
    }
    if (object1.type === FRACTION && object2.type === FRACTION) {
        const { num: num1, den: den1 } = object1.element;
        const { num: num2, den: den2 } = object2.element;

        return createFraction(
            createNumber(num1.element * den2.element + num2.element * den1.element),
            createNumber(den1.element * den2.element)
        )
    }
    if (object1.type === NUMBER && object2.type === FRACTION) {
        return add(createFraction(object1, createNumber(1)), object2)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        return add(object1, createFraction(object2, createNumber(1)))
    }
}

export const sub = (object1, object2) => {
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't sub types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        return add(object1, createFraction(neg(object2), createNumber(1)))
    }
    return add(object1, neg(object2))
}

export const mult = (object1, object2) => {
    if (object1.type === STRING && object2.type === NUMBER) {
        return createString([...(new Array(object2.element)).keys()].map(() => object1.element).join(''))
    }
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't mult types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === NUMBER && object2.type === NUMBER) {
        return createNumber(object1.element * object2.element)
    }
    if (object1.type === FRACTION && object2.type === FRACTION) {
        return createFraction(
            createNumber(object1.element.num.element * object2.element.num.element),
            createNumber(object1.element.den.element * object2.element.den.element)
        )
    }
    if (object1.type === NUMBER && object2.type === FRACTION) {
        return mult(createFraction(object1, createNumber(1)), object2)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        return mult(object1, createFraction(object2, createNumber(1)))
    }
}

export const divide = (object1, object2) => {
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't divide types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        return mult(object1, createFraction(createNumber(1), object2))
    }
    return mult(object1, inv(object2))
}

exportOnWindow({add})
