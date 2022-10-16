export class Wibor {
    name: string;
    value: number;


    constructor(name: string, value: number) {
        this.name = name
        this.value = value
    }


    getName() {
        console.log(this.name);
    }

    changeName() {
        this.name = "kupa"
    }

}
