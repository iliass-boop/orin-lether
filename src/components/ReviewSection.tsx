'use client';

import { useState } from 'react';
import styles from './ReviewSection.module.css';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
}

const initialReviews: Review[] = [
    {
        id: '1',
        author: 'James C.',
        rating: 5,
        date: '2 weeks ago',
        text: 'Ideally, I would have liked it to be a bit lighter, but the quality is undeniable. The leather smells amazing and feels incredibly sturdy.',
    },
    {
        id: '2',
        author: 'Sarah L.',
        rating: 5,
        date: '1 month ago',
        text: 'Perfect size for my daily commute. Fits my laptop and essentials without being bulky. The patina is starting to develop nicely.',
    },
];

interface ReviewSectionProps {
    productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [newReview, setNewReview] = useState({ author: '', rating: 5, text: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const review: Review = {
            id: Date.now().toString(),
            author: newReview.author || 'Anonymous',
            rating: newReview.rating,
            date: 'Just now',
            text: newReview.text,
        };
        setReviews([review, ...reviews]);
        setNewReview({ author: '', rating: 5, text: '' });
    };

    return (
        <div className={styles.reviews}>
            <h2 className={styles.title}>Customer Reviews</h2>

            <div className={styles.reviewList}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                            <span className={styles.author}>{review.author}</span>
                            <span className={styles.date}>{review.date}</span>
                        </div>
                        <div className={styles.rating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        <p className={styles.text}>{review.text}</p>
                    </div>
                ))}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <h3 className={styles.formTitle}>Write a Review</h3>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={newReview.author}
                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Rating</label>
                    <select
                        className={styles.input}
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Review</label>
                    <textarea
                        className={styles.textarea}
                        value={newReview.text}
                        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className={styles.submitBtn}>Submit Review</button>
            </form>
        </div>
    );
}
