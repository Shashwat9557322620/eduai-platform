import Link from 'next/link';
import Navbar from '../components/Navbar';
import ThreeBlogBackground from '../components/backgrounds/ThreeBlogBackground';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import { Calendar, Clock, ArrowUpRight, FileText } from 'lucide-react';

const POSTS = [
  {
    slug: 'ai-study-tips-2025',
    title: '10 AI-Powered Study Techniques That Actually Work in 2025',
    excerpt: 'Discover how artificial intelligence is revolutionizing the way students learn and retain information. Backed by cognitive science and real-world results.',
    date: 'May 25, 2025',
    readTime: '5 min read',
    tags: ['AI', 'Study Tips', 'Productivity'],
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    slug: 'curriculum-optimization-guide',
    title: 'The Complete Guide to Curriculum Optimization with AI',
    excerpt: 'Learn how to break down complex syllabi into manageable daily study protocols using neural algorithms and spaced repetition principles.',
    date: 'May 18, 2025',
    readTime: '8 min read',
    tags: ['Curriculum', 'AI Tools', 'Guide'],
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    slug: 'flashcard-memory-retention',
    title: 'Neural Flashcards: Boosting Memory Retention with AI',
    excerpt: 'How AI-generated flashcards can improve your long-term memory retention by up to 70%. A deep dive into the science of active recall and spaced repetition.',
    date: 'May 10, 2025',
    readTime: '6 min read',
    tags: ['Flashcards', 'Memory', 'Science'],
    gradient: 'from-emerald-400 to-green-500',
  },
  {
    slug: 'skill-gap-analysis-career',
    title: 'Bridging the Skill Gap: How to Future-Proof Your Career',
    excerpt: 'Use AI-powered skill gap analysis to identify exactly what you need to learn for your dream job. A strategic framework for continuous professional development.',
    date: 'May 2, 2025',
    readTime: '7 min read',
    tags: ['Career', 'Skills', 'Analysis'],
    gradient: 'from-amber-400 to-orange-500',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-white">
      <ThreeBlogBackground />

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-300 uppercase">Insights & Updates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">EduAI</span> Blog
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Insights, tutorials, and thought leadership from the team building the future of AI-powered education.
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6">
          {POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-[#07070a]/80 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-500"
            >
              <div className="p-8 md:p-10">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                  <span className="text-gray-800">•</span>
                  <div className="flex items-center gap-2 text-gray-600 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <h2 className={`text-2xl md:text-3xl font-bold mb-3 text-white/90 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${post.gradient} transition-all duration-500`}>
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-500 text-base leading-relaxed mb-6">{post.excerpt}</p>

                {/* Read More */}
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                  Read Article
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom gradient line */}
              <div className={`h-[2px] w-0 group-hover:w-full bg-gradient-to-r ${post.gradient} transition-all duration-700 ease-out`} />
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-purple-500/5 border border-white/[0.06] rounded-3xl p-10 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay in the Loop</h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-8">
            Get the latest articles, study tips, and product updates delivered to your inbox.
          </p>
          <NewsletterSubscribe />
        </div>

      </div>
    </div>
  );
}
