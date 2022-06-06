import { FRACTION, NUMBER } from "./objectTypes";

export const compute_pgcd = (a, b) => {
    a = Math.floor(Math.abs(a));
    b = Math.floor(Math.abs(b));
    if (b > a) {
        var tmp = a;
        a = b;
        b = tmp;
    }
    while (true) {
        if (b === 0) return a;
        a %= b;
        if (a === 0) return b;
        b %= a;
    }
}

export const getSign = (x) => {
    if (x.type === NUMBER) {
        if (x.element === 0) {
            return 0
        } else if (x.element > 0) {
            return 1;
        } else {
            return -1;
        }
    }
    if (x.type === FRACTION) {
        if (x.element.num.element === 0) {
            return 0;
        } else if (x.element.num.element > 0) {
            return 1;
        } else {
            return -1;
        }
    }
}

