namespace App{
    // autobind decorator
    export function autobind(
        _: any, 
        _2: string, 
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;  
        const adjustedDescritor: PropertyDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }        
        };
        return adjustedDescritor;
    }
}