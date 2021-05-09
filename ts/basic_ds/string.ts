namespace DS {
    export class MyString {
        Value: string;
        DisplayStr() {
            return `"${this.Value}"`;
        }
    }
    export class MyChar {
        Value: string;
        constructor(v: string) {
            this.Value = v;
        }
        DisplayStr() {
            return `#\\${this.Value}`;
        }
    }
}