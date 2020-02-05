export interface AllParams {
    products: Product[];
    [name: string]: any;
}

export interface Product {
    [name: string]: string;
}

export class Params {
    private params: AllParams = {products: []};

    getParam(name: string) {
        return this.params[name];
    }

    setParam(name: string, value: any): void {
        this.params[name] = value;
    }

    getParams(names: string[]) {
        return names.reduce((all, name) => ({
            ...all,
            [name]: this.getParam(name)
        }), {});
    }

    get products(): Product[] {
        return this.getParam('products');
    }

    set products(products: Product[]) {
        this.setParam('products', products);
    }
}
