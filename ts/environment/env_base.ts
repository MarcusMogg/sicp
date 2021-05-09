export interface Env {
    Get(key: string): any;
    Set(key: string, vaule: any): void;
    MakeChild(): Env;
    Parent(): Env;
}