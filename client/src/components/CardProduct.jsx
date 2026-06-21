import React, { useState } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/validURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from './AddToCartButton'
import { useGlobalContext } from '../provider/GlobalProvider'

const CardProduct = ({ data }) => {

    const [loading, setLoading] = useState(false)

    const url = `/product/${valideURLConvert(data?.name)}-${data?.id}`

    const productImage =
        data?.image?.[0] ||
        'https://via.placeholder.com/300x300?text=No+Image'

    return (
        <Link
            to={url}
            className='border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white'
        >

            <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
                <img
                    src={productImage}
                    alt={data?.name}
                    className='w-full h-full object-scale-down lg:scale-125'
                />
            </div>

            <div className='flex items-center gap-1'>

                <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50'>
                    10 min
                </div>

                {
                    Boolean(data?.discount) && (
                        <p className='text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full'>
                            {data.discount}% discount
                        </p>
                    )
                }

            </div>

            <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
                {data?.name}
            </div>

            <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
                {data?.unit}
            </div>

            <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>

                <div className='flex flex-col'>

                    <div className='font-semibold'>
                        {
                            DisplayPriceInRupees(
                                pricewithDiscount(
                                    data?.price,
                                    data?.discount
                                )
                            )
                        }
                    </div>

                    {
                        Boolean(data?.discount) && (
                            <div className='text-xs text-gray-500 line-through'>
                                {DisplayPriceInRupees(data?.price)}
                            </div>
                        )
                    }

                </div>

                <div>
                    {
                        Number(data?.stock) === 0 ? (
                            <p className='text-red-500 text-sm text-center'>
                                Out of stock
                            </p>
                        ) : (
                            <AddToCartButton data={data} />
                        )
                    }
                </div>

            </div>

        </Link>
    )
}

export default CardProduct