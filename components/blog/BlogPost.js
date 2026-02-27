
'use client'
import React, { useEffect, useState } from "react"
import BlogCard1 from "./BlogCard1"
import Pagination from "./Pagination"
import { getPostsList } from "@/lib/payload-api"
export default function BlogPost({ style, showItem, showPagination }) {
    let [currentPage, setCurrentPage] = useState(1)
    let showLimit = showItem,
        paginationItem = 4

    let [pagination, setPagination] = useState([])
    let [limit, setLimit] = useState(showLimit)
    let [pages, setPages] = useState(0)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        const run = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getPostsList({ page: currentPage, limit })
                const docs = Array.isArray(res?.docs) ? res.docs : []
                if (!isMounted) return

                // Map Payload post docs to the shape expected by BlogCard1.
                const imagePool = ["blog-in-01.jpg", "blog-in-02.jpg", "blog-in-03.jpg", "blog-in-04.jpg", "blog-in-05.jpg", "blog-in-06.jpg"]
                const mapped = docs.map((doc, idx) => ({
                    id: doc.slug, // keep compatibility with existing template hrefs
                    slug: doc.slug,
                    title: doc.title,
                    excerpt: doc.excerpt || doc?.seo?.description || "",
                    img: imagePool[idx % imagePool.length],
                }))

                setPosts(mapped)
                setPages(Number(res?.totalPages) || 1)
            } catch (e) {
                if (!isMounted) return
                setError(e?.message || "Failed to load posts")
                setPosts([])
                setPages(0)
            } finally {
                if (!isMounted) return
                setLoading(false)
            }
        }

        run()
        return () => {
            isMounted = false
        }
    }, [currentPage, limit])

    useEffect(() => {
        const count = pages || 0
        const arr = new Array(count).fill().map((_, idx) => idx + 1)
        setPagination(arr)
    }, [pages])

    const getPaginatedProducts = posts


    let start = Math.floor((currentPage - 1) / paginationItem) * paginationItem
    let end = start + paginationItem
    const getPaginationGroup = pagination.slice(start, end)

    const next = () => {
        setCurrentPage((page) => page + 1)
    }

    const prev = () => {
        setCurrentPage((page) => page - 1)
    }

    const handleActive = (item) => {
        setCurrentPage(item)
    }
    return (
        <>


            {loading && <h3>Loading...</h3>}
            {error && <h3>{error}</h3>}
            {!loading && !error && getPaginatedProducts.length === 0 && <h3>No Posts Found</h3>}

            {getPaginatedProducts.map(item => (
                <React.Fragment key={item.id}>
                    <BlogCard1 item={item} />
                </React.Fragment>
            ))}

            {showPagination &&
                <Pagination
                    getPaginationGroup={
                        getPaginationGroup
                    }
                    currentPage={currentPage}
                    pages={pages}
                    next={next}
                    prev={prev}
                    handleActive={handleActive}
                />
            }
        </>
    )
}
