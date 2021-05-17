import { Env } from "../environment/env_base";
import { DS } from "./bs"
import { Identifier } from "./quote";
export class Procedure implements DS {
    static readonly Type = "procedure";
    readonly Type = Procedure.Type;
    DisplayStr() {
        if (this.primitive)
            return "basic_procedure";
        else {
            return `(lambda (${this.parameters.map(x => x.Value).join(" ")}) ${(this.body as DS).DisplayStr()}`
        }
    }
    primitive: boolean;
    parameters: Array<Identifier>;
    body: DS | ((x: Array<DS>) => DS);
    env: Env;

    constructor(primitive: boolean, parameters: Array<Identifier>, body: DS | ((x: Array<DS>) => DS), env: Env) {
        this.primitive = primitive;
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
    equal(rhs: DS): boolean {
        return this === rhs;
    }
    Copy(): DS {
        return new Procedure(this.primitive,
            (this.parameters !== undefined) ?
                this.parameters.map(x => x.Copy() as Identifier) :
                this.parameters,
            this.primitive ? this.body : (this.body as DS).Copy(),
            this.env);
    }
}