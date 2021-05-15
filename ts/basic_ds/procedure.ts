import { Env } from "../environment/env_base";
import { DS } from "./bs"
import { Identifier } from "./quote";
export class Procedure implements DS {
    static readonly Type = "procedure";
    readonly Type = Procedure.Type;
    DisplayStr() {
        return "procedure";
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
}