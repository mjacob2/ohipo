export class Wibor {
    name: string;
    value: number;

    getName() {
        console.log("**************************")
        console.log(this.name);
    }

    getWibor() {
        return this.value;
    }

    changeWibor() {
        this.value -= 1;
    }


}
