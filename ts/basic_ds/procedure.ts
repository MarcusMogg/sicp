import { Env } from "../environment/env_base";
import { DS } from "./bs"
import { Identifier } from "./quote";
export class Procedure implements DS {
    static readonly Type = "procedure";
    readonly Type = Procedure.Type;

    parameters: Array<DS>;
    body: DS;
    env: Env;

    constructor(parameters: Array<DS>, body: DS, env: Env) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
}