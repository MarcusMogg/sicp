import { DS } from "../basic_ds/bs";

export interface Env {
    Get(key: string): any;
    Set(key: string, vaule: any): void;
    MakeChild(): Env;
    Parent(): Env;
}

export class SimpleEnv implements Env {
    private parent_: SimpleEnv;
    private map_: Map<string, DS>

    constructor() {
        this.map_ = new Map();
        this.parent_ = undefined;
    }

    Get(key: string): DS {
        if (this.map_.has(key)) {
            return this.map_.get(key);
        }
        if (this.parent_ === undefined)
            throw new Error(`undeclare ${key}`);
        return this.parent_.Get(key);
    }
    Set(key: string, vaule: DS) {
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