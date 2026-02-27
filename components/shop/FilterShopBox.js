'use client'
import { addCart } from "@/features/shopSlice"
import { addWishlist } from "@/features/wishlistSlice"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getProductsList } from "@/lib/payload-api"
import {
    addPerPage,
    addSort,
    addprice,
    clearBrand,
    clearCategory,
    clearColor,
} from "../../features/filterSlice"
import {
    clearBrandToggle,
    clearCategoryToggle,
    clearColorToggle,
} from "../../features/productSlice"
import ShopCard from "./ShopCard"
import ShopCardList from "./ShopCardList"

const FilterShopBox = () => {
    const { shopList, shopSort } = useSelector((state) => state.filter)
    const {
        price,

        category,
        color,
        brand,
    } = shopList || {}

    const { sort, perPage } = shopSort

    const dispatch = useDispatch()

    const [activeIndex, setActiveIndex] = useState(2)
    const handleOnClick = (index) => {
        setActiveIndex(index)
    }

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [docs, setDocs] = useState([])

    useEffect(() => {
        let isMounted = true

        const run = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await getProductsList({ page: 1, limit: 50 })
                const list = Array.isArray(res?.docs) ? res.docs : []
                if (!isMounted) return
                setDocs(list)
            } catch (e) {
                if (!isMounted) return
                setError(e?.message || "Failed to load products")
                setDocs([])
            } finally {
                if (!isMounted) return
                setIsLoading(false)
            }
        }

        run()
        return () => {
            isMounted = false
        }
    }, [])

    const products = useMemo(() => {
        const imagePool = [
            ["product-1.jpg", "product-2.jpg"],
            ["product-3.jpg", "product-4.jpg"],
            ["product-5.jpg", "product-6.jpg"],
            ["product-7.jpg", "product-8.jpg"],
        ]

        return docs.map((doc, idx) => {
            const images = imagePool[idx % imagePool.length]
            const priceNow = typeof doc?.salePrice === "number" ? doc.salePrice : doc?.basePrice
            const priceOld = typeof doc?.salePrice === "number" ? doc?.basePrice : null

            return {
                id: doc.slug,
                slug: doc.slug,
                title: doc.title,
                imgf: images[0],
                imgb: images[1],
                price: {
                    min: 0,
                    max: priceNow,
                },
                priceOld,
            }
        })
    }, [docs])

    const addToCart = (id) => {
        const item = products?.find((item) => item.id === id)
        dispatch(addCart({ product: item }))
    }
    const addToWishlist = (id) => {
        const item = products?.find((item) => item.id === id)
        dispatch(addWishlist({ product: item }))
    }

    // location filter
    const priceFilter = (item) =>
        item?.price?.min >= price?.min && item?.price?.max <= price?.max

    // product-type filter



    // product-type filter
    const categoryFilter = (item) =>
        category?.length !== 0 && item?.category !== undefined ? category?.includes(item?.category[0]?.type.toLocaleLowerCase().split(" ").join("-")) : item

    // product-type filter
    const colorFilter = (item) =>
        color?.length !== 0 && item?.color !== undefined ? color?.includes(item?.color[0]?.type.toLocaleLowerCase().split(" ").join("-")) : item

    // product-type filter
    const brandFilter = (item) =>
        brand?.length !== 0 && item?.brand !== undefined ? brand?.includes(item?.brand[0]?.type.toLocaleLowerCase().split(" ").join("-")) : item

    // sort filter
    const sortFilter = (a, b) =>
        sort === "des" ? a.id > b.id && -1 : a.id < b.id && -1

    let content = products
        ?.filter(priceFilter)

        ?.filter(categoryFilter)
        ?.filter(colorFilter)
        ?.filter(brandFilter)
        ?.sort(sortFilter).slice(perPage.start, perPage.end !== 0 ? perPage.end : 10)?.map((item, i) => (
            <Fragment key={i}>
                <ShopCard item={item} addToCart={addToCart} addToWishlist={addToWishlist} activeIndex={activeIndex} handleOnClick={handleOnClick} />
            </Fragment>
            // End all products
        ))

    // sort handler
    const sortHandler = (e) => {
        dispatch(addSort(e.target.value))
    }

    // per page handler
    const perPageHandler = (e) => {
        const pageData = JSON.parse(e.target.value)
        dispatch(addPerPage(pageData))
    }

    // clear all filters
    const clearAll = () => {
        dispatch(addprice({ min: 0, max: 100 }))




        dispatch(clearCategory())
        dispatch(clearCategoryToggle())

        dispatch(clearColor())
        dispatch(clearColorToggle())

        dispatch(clearBrand())
        dispatch(clearBrandToggle())

        dispatch(addSort(""))
        dispatch(addPerPage({ start: 0, end: 0 }))
    }



    return (
        <>
            {isLoading ? <h3>Loading...</h3> : null}
            {error ? <h3>{error}</h3> : null}
            <div className="product-filter-content mb-40">
                <div className="row align-items-center">
                    <div className="col-sm-6">
                        <div className="product-item-count">
                            <span><b>{content?.length}</b> Item On List</span>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="product-navtabs d-flex justify-content-end align-items-center">
                            <div className="tp-shop-selector">

                                {price?.min !== 0 ||
                                    price?.max !== 100 ||

                                    category?.length !== 0 ||
                                    color?.length !== 0 ||
                                    brand?.length !== 0 ||
                                    sort !== "" ||
                                    perPage.start !== 0 ||
                                    perPage.end !== 0 ? (
                                    <button
                                        onClick={clearAll}
                                        className="btn btn-danger text-nowrap me-2"
                                        style={{ minHeight: "45px", marginBottom: "15px" }}
                                    >
                                        Clear All
                                    </button>
                                ) : undefined}

                                <select
                                    value={sort}
                                    className="chosen-single form-select"
                                    onChange={sortHandler}
                                >
                                    <option value="">Sort by (default)</option>
                                    <option value="asc">Newest</option>
                                    <option value="des">Oldest</option>
                                </select>


                                <select
                                    onChange={perPageHandler}
                                    className="chosen-single form-select ms-3 "
                                    value={JSON.stringify(perPage)}
                                >
                                    <option
                                        value={JSON.stringify({
                                            start: 0,
                                            end: 0,
                                        })}
                                    >
                                        All
                                    </option>
                                    <option
                                        value={JSON.stringify({
                                            start: 0,
                                            end: 10,
                                        })}
                                    >
                                        10 per page
                                    </option>
                                    <option
                                        value={JSON.stringify({
                                            start: 0,
                                            end: 20,
                                        })}
                                    >
                                        20 per page
                                    </option>
                                    <option
                                        value={JSON.stringify({
                                            start: 0,
                                            end: 30,
                                        })}
                                    >
                                        30 per page
                                    </option>
                                </select>
                            </div>
                            <div className="tpproductnav tpnavbar product-filter-nav">
                                <nav>
                                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                        <button className={activeIndex == 1 ? "nav-link active" : "nav-link"} onClick={() => handleOnClick(1)}><i className="fal fa-list-ul" /></button>
                                        <button className={activeIndex == 2 ? "nav-link active" : "nav-link"} onClick={() => handleOnClick(2)}><i className="fal fa-th" /></button>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="row mb-50">
                <div className="col-lg-12">
                    <div className="tab-content" id="nav-tabContent">
                        <div className={activeIndex == 1 ? "tab-pane fade show active" : "tab-pane fade"}>
                            {
                                products
                                    ?.filter(priceFilter)

                                    ?.filter(categoryFilter)
                                    ?.filter(colorFilter)
                                    ?.filter(brandFilter)
                                    ?.sort(sortFilter).slice(perPage.start, perPage.end !== 0 ? perPage.end : 10)?.map((item, i) => (
                                        <Fragment key={i}>
                                            <ShopCardList item={item} addToCart={addToCart} addToWishlist={addToWishlist} />
                                        </Fragment>
                                        // End all products
                                    ))
                            }
                        </div>
                        <div className={activeIndex == 2 ? "tab-pane fade show active" : "tab-pane fade"}>
                            <div className="row row-cols-xxl-4 row-cols-xl-4 row-cols-lg-3 row-cols-md-3 row-cols-sm-2 row-cols-1 tpproduct">
                                {
                                    products
                                        ?.filter(priceFilter)

                                        ?.filter(categoryFilter)
                                        ?.filter(colorFilter)
                                        ?.filter(brandFilter)
                                        ?.sort(sortFilter).slice(perPage.start, perPage.end !== 0 ? perPage.end : 10)?.map((item, i) => (
                                            <Fragment key={i}>
                                                <ShopCard item={item} addToCart={addToCart} addToWishlist={addToWishlist} />
                                            </Fragment>
                                            // End all products
                                        ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default FilterShopBox
