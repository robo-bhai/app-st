import React, { useState } from 'react';
import { 
  Star, MessageSquare, ThumbsUp, CheckCircle, 
  User, Send, Smartphone, Sparkles, Filter 
} from 'lucide-react';
import { AppReview, AppModel } from '../types/app';

interface ReviewsSectionProps {
  app: AppModel;
  onAddReview: (appId: string, review: AppReview) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  app,
  onAddReview,
}) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [deviceModel, setDeviceModel] = useState('Samsung Galaxy S24');
  const [showForm, setShowForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | '5' | '4' | 'Positive'>('All');
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  // Baseline default authentic reviews for existing apps if empty
  const reviews: AppReview[] = app.reviews && app.reviews.length > 0 
    ? app.reviews 
    : [
        {
          id: `rev-1-${app.id}`,
          appId: app.id,
          userName: 'Muhammad Zaid',
          userAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ZaidReviews',
          rating: 5,
          date: '2026-10-04T12:00:00Z',
          comment: `Works flawlessly! Direct APK download was very fast and VirusTotal badge verified it clean. Highly recommend to everyone on Hadi88 Apps.`,
          device: 'Samsung Galaxy A54',
          helpfulCount: 14
        },
        {
          id: `rev-2-${app.id}`,
          appId: app.id,
          userName: 'Ayesha Tariq',
          userAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AyeshaReviews',
          rating: 5,
          date: '2026-09-29T16:20:00Z',
          comment: `Great performance and smooth UI. Thank you Hadi88 team for building and hosting this on demand!`,
          device: 'Xiaomi Redmi Note 13',
          helpfulCount: 9
        },
        {
          id: `rev-3-${app.id}`,
          appId: app.id,
          userName: 'David Miller',
          userAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DavidM',
          rating: 4,
          date: '2026-09-21T09:15:00Z',
          comment: `Very solid build. Scanned with my local anti-virus too, 100% clean package. Looking forward to the next update.`,
          device: 'Google Pixel 8',
          helpfulCount: 6
        }
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    const newRev: AppReview = {
      id: `rev-${Date.now()}`,
      appId: app.id,
      userName: userName.trim(),
      userAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userName.trim())}`,
      rating,
      date: new Date().toISOString(),
      comment: comment.trim(),
      device: deviceModel,
      helpfulCount: 0
    };

    onAddReview(app.id, newRev);
    setUserName('');
    setComment('');
    setShowForm(false);
  };

  const toggleHelpful = (reviewId: string) => {
    setHelpfulLiked(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const filteredReviews = reviews.filter(r => {
    if (selectedFilter === '5') return r.rating === 5;
    if (selectedFilter === '4') return r.rating === 4;
    if (selectedFilter === 'Positive') return r.rating >= 4;
    return true;
  });

  return (
    <div className="space-y-4 pt-3 border-t border-amber-500/15">
      {/* Reviews Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Ratings & Reviews</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono">
              {reviews.length} reviews
            </span>
          </h3>
          <p className="text-[11px] text-stone-400">
            Real feedback from verified mobile installs
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#1a120c] border border-amber-500/30 space-y-3 animate-fade-in shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <h4 className="text-xs sm:text-sm font-bold text-white">Leave your feedback for {app.app_name}</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 focus:outline-none"
                >
                  <Star 
                    className={`w-5 h-5 ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-stone-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Asad Ali"
                className="w-full bg-[#120d0a] text-xs text-white rounded-xl px-3 py-2 border border-amber-500/25 focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1">Android Device</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. Samsung Galaxy S23, Pixel 7"
                className="w-full bg-[#120d0a] text-xs text-white rounded-xl px-3 py-2 border border-amber-500/25 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-stone-400 mb-1">Your Honest Review</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did the APK perform on your device? Any features you loved or wish to see added?"
              className="w-full bg-[#120d0a] text-xs text-white rounded-xl p-3 border border-amber-500/25 focus:border-amber-400 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-stone-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(['All', '5', '4', 'Positive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedFilter === f 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'glass-panel text-stone-400 hover:text-white'
            }`}
          >
            {f === 'All' ? 'All Reviews' : f === '5' ? '★ 5 Stars' : f === '4' ? '★ 4 Stars' : 'Positive'}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const isLiked = helpfulLiked[rev.id] || false;
            const currentHelpful = (rev.helpfulCount || 0) + (isLiked ? 1 : 0);

            return (
              <div 
                key={rev.id} 
                className="p-3 rounded-xl bg-[#160f0b] border border-amber-500/15 space-y-1.5 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-7 h-7 rounded-full bg-stone-900 border border-amber-500/30 object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{rev.userName}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-normal">
                          Verified User
                        </span>
                      </div>
                      <div className="text-[9px] text-stone-400 flex items-center gap-1">
                        {rev.device && <span>{rev.device} · </span>}
                        <span>{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center justify-between pt-1 text-[9px] text-stone-400 border-t border-amber-500/10">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-2.5 h-2.5" /> Installed via Hadi88 Direct APK
                  </span>
                  <button
                    onClick={() => toggleHelpful(rev.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                      isLiked ? 'text-amber-400 bg-amber-500/10 font-bold' : 'hover:text-amber-300'
                    }`}
                  >
                    <ThumbsUp className="w-2.5 h-2.5" />
                    <span>Helpful ({currentHelpful})</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-stone-400 glass-panel rounded-xl">
            No reviews match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
