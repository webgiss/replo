/* eslint-disable jest/valid-title */
import parser from './rplSyntax'

describe('parse', () => {
    const parserTest = (/** @type{string} */ text, input, expected) => it(text, () => {
        const actual = [...parser.parse(input)]

        expect(actual).toStrictEqual(expected)
    })
    const parserFailTest = (/** @type{string} */ text, input, expectedErrorLines) => it(text, () => {
        let message = null
        try {
            parser.parse(input)
        } catch (e) {
            message = e.message
        }

        expect(message).not.toBeNull()
        expect(message).toEqual(expectedErrorLines.join('\n'))
    })
    parserTest('should not return elements for an empty string', '', [])
    parserTest('should split on spaces for basical examples', '7 3 +', [
        { type: 'NUMBER', element: 7, repr: '7' },
        { type: 'NUMBER', element: 3, repr: '3' },
        { type: 'COMMAND', name: '+', repr: '+', element: '+' }
    ])

    parserTest('should split between a number and an operation', '7 3+', [
        { type: 'NUMBER', element: 7, repr: '7' },
        { type: 'NUMBER', element: 3, repr: '3' },
        { type: 'COMMAND', name: '+', repr: '+', element: '+' }
    ])
    parserTest('should split on spaces inside strings', '1 2 "poide 3" 4', [
        { type: 'NUMBER', element: 1, repr: '1' },
        { type: 'NUMBER', element: 2, repr: '2' },
        { type: 'STRING', element: "poide 3", repr: '"poide 3"' },
        { type: 'NUMBER', element: 4, repr: '4' },
    ])
    parserTest('should accept a list', '{   7    8 "test"  9 }  ', [
        {
            type: 'LIST', element: [
                { type: 'NUMBER', element: 7, repr: '7' },
                { type: 'NUMBER', element: 8, repr: '8' },
                { type: 'STRING', element: "test", repr: '"test"' },
                { type: 'NUMBER', element: 9, repr: '9' },
            ], repr: '{ 7 8 "test" 9 }'
        },
    ])
    parserFailTest('should reject an unfinished list', '{   7    8 "test"  9   ', [
        "Parse error on line 1:",
        "... 7    8 \"test\"  9   ",
        "-----------------------^",
        "Expecting 'NUMBER', 'STRING', 'VAR', 'COMMAND', '<<', '{', '}', got 'EOF'",
    ])
    parserTest('should accept finished program', '<< 1 2 "poide 3" 4 >>', [
        {
            type: 'PROGRAM', element: [
                { type: 'NUMBER', element: 1, repr: '1' },
                { type: 'NUMBER', element: 2, repr: '2' },
                { type: 'STRING', element: "poide 3", repr: '"poide 3"' },
                { type: 'NUMBER', element: 4, repr: '4' },
            ], repr: '<< 1 2 "poide 3" 4 >>'
        },
    ])
    parserTest('should accept finished program and other elements', '<< 1 2 "poide 3" 4 >> \'r\' sto', [
        {
            type: 'PROGRAM', element: [
                { type: 'NUMBER', element: 1, repr: '1' },
                { type: 'NUMBER', element: 2, repr: '2' },
                { type: 'STRING', element: "poide 3", repr: '"poide 3"' },
                { type: 'NUMBER', element: 4, repr: '4' },
            ], repr: '<< 1 2 "poide 3" 4 >>'
        },
        { type: 'VAR', element: 'r', repr: '\'r\'', name:'r' },
        { type: 'COMMAND', element: 'sto', repr: 'sto', name:'sto' },
    ])
    parserFailTest(
        'should refuse an unfinished program', 
        '<< 1 2 "poide 3" 4', 
        [
            "Parse error on line 1:",
            "<< 1 2 \"poide 3\" 4",
            "------------------^",
            "Expecting 'NUMBER', 'STRING', 'VAR', 'COMMAND', '<<', '>>', '{', 'if', got 'EOF'",
        ]
    )
})
