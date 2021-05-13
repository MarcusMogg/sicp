import { Datum } from "../expression/datum";

export interface Env {
    Get(key: string): any;
    Set(key: string, vaule: any): void;
    MakeChild(): Env;
    Parent(): Env;
}

export class SimpleEnv implements Env {
    private parent_: SimpleEnv;
    private map_: Map<string, Datum>

    constructor() {
        this.map_ = new Map();
        this.parent_ = undefined;
    }

    Get(key: string): Datum {
        if (this.map_.has(key)) {
            return this.map_.get(key);
        }
        return this.parent_ === undefined ?
            undefined :
            this.parent_.Get(key);
    }
    Set(key: string, vaule: Datum) {
        this.map_.set(key, vaule);
    }
    MakeChild(): SimpleEnv {
        let res = new SimpleEnv();
        res.setParent(this);
        return res;
    }
    Parent(): SimpleEnv {
        return this.parent_;
    }

    setParent(p: SimpleEnv) {
        this.parent_ = p;
    }
}