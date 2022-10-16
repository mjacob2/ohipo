export class Wibor {
    name: string;
    value: number;


    // constructor(name: string, value: number) {
    //     this.name = name
    //     this.value = value
    // }




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
