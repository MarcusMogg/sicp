export interface DS {
    readonly Type: string;
    equal(rhs: DS): boolean;
    DisplayStr(): string;
    Copy(): DS;
}