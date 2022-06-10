import exportOnWindow from "../../tools/exportOnWindow";
import { createComplex, createFraction, createNumber, createString } from "./objects";
import { COMPLEX, FRACTION, NUMBER, STRING } from "./objectTypes";

const isInteger = (x) => Math.floor(x) === x
const isNumberInteger = (x) => isInteger(x.element)

export const neg = (object) => {
    if (object.type === NUMBER) {
        return createNumber(-object.element)
    }
    if (object.type === FRACTION) {
        return createFraction(neg(object.element.num), object.element.den)
    }
    if (object.type === COMPLEX) {
        return createComplex(neg(object.element.re), neg(object.element.im))
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
    if (object.type === COMPLEX) {
        const { re, im } = object.element
        const den = add(mult(re, re), mult(im, im))
        return createComplex(divideFract(re, den), neg(divideFract(im, den)))
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
        if (isNumberInteger(object1)) {
            return add(createFraction(object1, createNumber(1)), object2)
        } else {
            return add(object1, createNumber(object2.element.num.element / object2.element.den.element))
        }
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        if (isNumberInteger(object2)) {
            return add(object1, createFraction(object2, createNumber(1)))
        } else {
            return add(createNumber(object1.element.num.element / object1.element.den.element), object2)
        }
    }
    if ((object1.type === NUMBER || object1.type === FRACTION) && object2.type === COMPLEX) {
        return add(createComplex(object1, createNumber(0)), object2)
    }
    if (object1.type === COMPLEX && (object2.type === NUMBER || object2.type === FRACTION)) {
        return add(object1, createComplex(object2, createNumber(0)))
    }
    if (object1.type === COMPLEX && object2.type === COMPLEX) {
        const { re: re1, im: im1 } = object1.element
        const { re: re2, im: im2 } = object2.element
        return createComplex(add(re1, re2), add(im1, im2))
    }
    Error(`Don't know how to add types [${object1.type}] and [${object2.type}]`)
}

export const sub = (object1, object2) => {
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't sub types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        if (isNumberInteger(object2)) {
            return add(object1, createFraction(neg(object2), createNumber(1)))
        } else {
            return add(createNumber(object1.element.num.element / object1.element.den.element), neg(object2))
        }
    }
    if (object1.type === COMPLEX && (object2.type === NUMBER || object2.type === FRACTION)) {
        return add(object1, createComplex(neg(object2), createNumber(0)))
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
        if (isNumberInteger(object1)) {
            return mult(createFraction(object1, createNumber(1)), object2)
        } else {
            return createNumber(object1.element * (object2.element.num.element / object2.element.den.element))
        }
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        if (isNumberInteger(object2)) {
            return mult(object1, createFraction(object2, createNumber(1)))
        } else {
            return createNumber((object1.element.num.element / object1.element.den.element) * object2.element)
        }
    }
    if ((object1.type === NUMBER || object1.type === FRACTION) && object2.type === COMPLEX) {
        return mult(createComplex(object1, createNumber(0)), object2)
    }
    if (object1.type === COMPLEX && (object2.type === NUMBER || object2.type === FRACTION)) {
        return mult(object1, createComplex(object2, createNumber(0)))
    }
    if (object1.type === COMPLEX && object2.type === COMPLEX) {
        const { re: re1, im: im1 } = object1.element
        const { re: re2, im: im2 } = object2.element
        return createComplex(sub(mult(re1, re2), mult(im2, im1)), add(mult(re1, im2), mult(re2, im1)))
    }
    Error(`Don't know how to mult types [${object1.type}] and [${object2.type}]`)
}

export const divide = (object1, object2) => {
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't divide types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        if (isNumberInteger(object2)) {
            return mult(object1, createFraction(createNumber(1), object2))
        } else {
            return createNumber((object1.element.num.element / object1.element.den.element) / object2.element)
        }
    }
    return mult(object1, inv(object2))
}

export const divideFract = (object1, object2) => {
    if (object1.type === NUMBER && object2.type === NUMBER && isNumberInteger(object1) && isNumberInteger(object2)) {
        return createFraction(object1, object2)
    }
    return divide(object1, object2)
}

export const compareJsScalar = (num1, num2) => {
    if (num1 === num2) {
        return 0
    } else if (num1 < num2) {
        return -1
    } else if (num1 > num2) {
        return 1
    }
    return 0
}

export const compare = (object1, object2) => {
    if (object1.type === STRING && object2.type === STRING) {
        return compareJsScalar(object1.element, object2.element)
    }
    if (object1.type === STRING || object2.type === STRING) {
        throw new Error(`Can't compare types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === COMPLEX || object2.type === COMPLEX) {
        throw new Error(`Can't compare types [${object1.type}] and [${object2.type}]`)
    }
    if (object1.type === NUMBER && object2.type === NUMBER) {
        return compareJsScalar(object1.element, object2.element)
    }
    if (object1.type === FRACTION && object2.type === FRACTION) {
        const { num: num1, den: den1 } = object1.element;
        const { num: num2, den: den2 } = object2.element;

        return compareJsScalar(num1*den2, num2*den1)
    }
    if (object1.type === NUMBER && object2.type === FRACTION) {
        if (isNumberInteger(object1)) {
            return compare(createFraction(object1, createNumber(1)), object2)
        } else {
            return compare(object1, createNumber(object2.element.num.element / object2.element.den.element))
        }
    }
    if (object1.type === FRACTION && object2.type === NUMBER) {
        if (isNumberInteger(object2)) {
            return compare(object1, createFraction(object2, createNumber(1)))
        } else {
            return compare(createNumber(object1.element.num.element / object1.element.den.element), object2)
        }
    }
}

exportOnWindow({ add })
