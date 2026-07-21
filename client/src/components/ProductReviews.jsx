import React, { useState, useEffect } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import AxiosToastError from '../utils/AxiosToastError';
import moment from 'moment';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const user = useSelector(state => state.user);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                url: SummaryApi.getReviews.url(productId),
                method: SummaryApi.getReviews.method,
            });

            if (response.data.success) {
                setReviews(response.data.data);
                
                // If user already reviewed, pre-fill
                if (user?._id) {
                    const myReview = response.data.data.find(r => r.user_id === user._id);
                    // Note: API returns name and avatar from users table, not user_id directly unless selected. 
                    // Let's rely on finding by matching name/avatar or just leave form blank if not easily matched without user_id in SELECT.
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?._id) {
            toast.error("Please login to submit a review");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        try {
            setSubmitting(true);
            const response = await Axios({
                ...SummaryApi.addReview,
                data: {
                    productId: productId,
                    rating: rating,
                    comment: comment
                }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setRating(0);
                setComment("");
                fetchReviews(); // Refresh list
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-8 bg-white p-4 lg:p-6 rounded shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            
            <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-green-700">{averageRating}</div>
                <div>
                    <StarRating rating={Math.round(averageRating)} readonly size="lg" />
                    <p className="text-sm text-neutral-500 mt-1">Based on {reviews.length} reviews</p>
                </div>
            </div>

            <hr className="my-6 border-slate-200" />

            {/* Write a review */}
            {user?._id ? (
                <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-4 rounded border border-slate-200">
                    <h4 className="font-semibold mb-3">Write a Review</h4>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Rating</label>
                        <StarRating rating={rating} setRating={setRating} size="md" />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Comment (optional)</label>
                        <textarea 
                            className="w-full border rounded p-2 outline-none focus:border-green-500 resize-none h-24"
                            placeholder="What did you like or dislike?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <button 
                        disabled={submitting}
                        className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 disabled:bg-green-400"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded border border-blue-100">
                    Please log in to write a review for this product.
                </div>
            )}

            {/* Review List */}
            {loading ? (
                <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                                    {review.avatar ? (
                                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                            {review.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{review.name}</p>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} readonly size="sm" />
                                        <span className="text-xs text-neutral-400">{moment(review.created_at).fromNow()}</span>
                                    </div>
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-slate-700 text-sm mt-2">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-neutral-500">No reviews yet. Be the first to review this product!</p>
            )}
        </div>
    );
};

export default ProductReviews;
