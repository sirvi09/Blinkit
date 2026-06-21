export const DisplayPriceInRupees = (price) =>{
    return new Intl.NumberFormat('en-In',{
        style : 'currency',
        currency : 'INR'
    }).format(price)
}