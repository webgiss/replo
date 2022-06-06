%{
const {createNumber, createString, createCommand, createVar, createVarCall, createList, dupObject, createKeyword, createProgram, createIfThenElseEnd} = require('./objects.js')
const {commands} = require('./commands.js')
%}

%lex
%%

\n                                          {}
\s+                                         {}
\t                                          {}
"<<"                                        {return '<<'}
">>"                                        {return '>>'}
"if"                                        {return 'if'}
"then"                                      {return 'then'}
"else"                                      {return 'else'}
"end"                                       {return 'end'}
"{"                                         {return '{'}
"}"                                         {return '}'}
"-"?[0-9]+("."[0-9]+)?                      {return 'NUMBER'}
\"[^"]+\"                                   {return 'STRING'}
<<EOF>>                                     {return 'EOF'}
"'"[a-zA-Z_\-+*/<>][a-zA-Z_\-+*/<>0-9]*"'"  {return 'VAR'}
[a-zA-Z_\-+*/<>][a-zA-Z_\-+*/<>0-9]*        {return 'COMMAND'}
.                                           {return 'INVALID'}

/lex

%start expressions

%%

expressions
    : items EOF
        { 
            // console.log($1)
            return $1 
        }
    | EOF
        { return [] }
    ;

items
    : items item
        { $$ = [ ...$1, $2 ] }
    | item
        { $$ = [ $1 ] }
    ;

item
    : NUMBER
        { $$ = createNumber(Number.parseFloat(yytext)) }
    | STRING
        { $$ = createString(yytext.slice(1, yytext.length - 1)) }
    | VAR
        { $$ = createVar(yytext.slice(1, yytext.length - 1)) }
    | COMMAND
        { $$ = commands[yytext] !== undefined ? createCommand(yytext, commands[yytext]) : createVarCall(yytext) }
    | program
        { $$ = $1 }
    | list
        { $$ = $1 }
    ;

program_items
    : program_items program_item
        { $$ = [ ...$1, $2 ] }
    | program_item
        { $$ = [ $1 ] }
    ;

program_item
    : item
        { $$ = $1 }
    | itee
        { $$ = $1 }
    ;

program
    : '<<' program_items '>>'
        { $$ = createProgram($2) }
    ;

list
    : '{' items '}'
        { $$ = createList($2) }
    ;

itee
    : 'if' items 'then' items 'else' items 'end'
        { $$ = createIfThenElseEnd($2,$4,$6) }
    | 'if' items 'then' items 'end'
        { $$ = createIfThenElseEnd($2,$4) }
    ;
