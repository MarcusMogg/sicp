namespace Exp {
    export enum ExpType {
        SelfEvaluating = 1, // number or string or char 
        Variable,           // variable
        Quoted,             // 'variable
        Assignment,         // (set x x)
        Definition,         // (define)
        IF,                 // if
        Lambda,             // lambda
        Begin,              // begin
        Cond,               // cond
        Application,        // (lambda arg1)
        Let,                // let

    }


    export interface ExpBase {
        Type: ExpType
    }
}