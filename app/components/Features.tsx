import Link from 'next/link';

export default function Features() {
  const tools = [
    {
      title: "Curriculum Optimizer",
      description: "Restructure dense syllabus into bite-sized, personalized daily study plans.",
      color: "from-blue-500 to-cyan-400",
      link: "/optimizer" // Path to the new tool
    },
    {
      title: "AI Flashcard Generator",
      description: "Paste any text or PDF and instantly generate interactive study flashcards.",
      color: "from-emerald-400 to-green-500",
      link: "#" // Not built yet
    },
    {
      title: "Skill Gap Analyzer",
      description: "Scrape job postings and find the exact skills missing from your resume.",
      color: "from-purple-500 to-pink-500",
      link: "#" // Not built yet
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24" id="tools">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter">Your AI Study Arsenal</h2>
        <p className="text-gray-400 text-lg">Everything you need to crack exams and land jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Link href={tool.link} key={index} className="block group">
            <div 
              className="bg-[#121214] border border-gray-800 p-8 rounded-2xl group-hover:-translate-y-2 group-hover:border-gray-600 transition-all duration-300 cursor-pointer h-full relative overflow-hidden group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]"
            >
              {/* Subtle top glare fade on hover */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              
              {/* Glowing Top Line */}
              <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${tool.color} mb-6 group-hover:w-full transition-all duration-300`}></div>
              
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{tool.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {tool.description}
              </p>
              
              <span className="text-sm font-semibold text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                Try Now <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}