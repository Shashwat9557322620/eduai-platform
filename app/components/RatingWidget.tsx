"use client";
import { useState } from 'react';

interface RatingWidgetProps {
  userId?: string | null;
  onSubmitted?: () => void;
  className?: string;
}

export default function RatingWidget({ userId, onSubmitted, className = '' }: RatingWidgetProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const getEmoji = (stars: number) => {
    if (stars === 0) return { emoji: '💬', label: 'Rate us', color: 'text-gray-500' };
    if (stars <= 2) return { emoji: '😞', label: 'Needs Improvement', color: 'text-red-400' };
    if (stars === 3) return { emoji: '😐', label: 'It\'s Okay', color: 'text-yellow-400' };
    if (stars === 4) return { emoji: '😊', label: 'Great!', color: 'text-cyan-400' };
    return { emoji: '🤩', label: 'Amazing!', color: 'text-green-400' };
  };

  const currentEmoji = getEmoji(rating);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          rating,
          message: message || `Rating: ${rating}/5 stars`,
        }),
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 ${className}`}>
        <span className="text-lg">🎉</span>
        <div>
          <p className="text-sm font-bold text-green-400">Thanks for your feedback!</p>
          <p className="text-xs text-green-500/60">Your rating was sent to the team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs font-semibold hover:text-white hover:bg-white/[0.08] transition-all hover:border-yellow-500/40"
        >
          <span className="text-base">💬</span>
          Rate this
        </button>
      ) : (
        <div className="bg-[#07070a] border border-white/10 rounded-2xl p-5 max-w-md">
          <div className="flex items-center justify-center mb-3">
            <div className={`text-5xl transition-all duration-300 ${currentEmoji.color}`}>
              {currentEmoji.emoji}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 font-mono mb-4 uppercase tracking-widest">
            {currentEmoji.label}
          </p>
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-all duration-150 hover:scale-110 active:scale-90"
              >
                <svg className={`w-8 h-8 transition-all duration-200 ${
                  star <= (hoveredStar || rating)
                    ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                    : 'text-gray-600'
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more (optional)..."
            className="w-full bg-[#020203] border border-white/10 rounded-xl p-3 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 resize-none mb-4"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                rating === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]'
              }`}
            >
              {loading ? 'Sending...' : `Send ${currentEmoji.emoji}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
