import Image from 'next/image'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const categories = [
  { label: 'Sports', icon: 'sports_tennis', active: true },
  { label: 'Music', icon: 'music_note' },
  { label: 'Tech', icon: 'code' },
  { label: 'Cooking', icon: 'restaurant' },
  { label: 'Design', icon: 'brush' },
  { label: 'Fitness', icon: 'self_improvement' },
]

const experts = [
  {
    id: 'rajesh-m',
    name: 'Priya Sharma',
    skill: 'Yoga & Wellness',
    rate: '₹1,200',
    rating: '4.9',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENaonpTGDLeR8y30HBgV2D04I4q4vXIrGprMF6qhP5gxrCGWylBs4xO5BeRbSdGqTgWS8q33aw2pn0u8uTFC8BjbqwbpzyZKaluvqBfLLKwPF7JgTz3xOJV7sW26Pvm8KWJjUnkPXnbBQ1RihCOo0OLM5F3gS7axFmlNO5R60OpeIyMcCgZGU81_3xnwr-B11KzCe4gjyX76AEMlTTi6pMTWsiGDiuNI6pUiFl7jsdF-jIkL-2SVE1HBpyMasp0GdBz6JeFRatqs',
  },
  {
    id: 'vikram-roy',
    name: 'Vikram Roy',
    skill: 'Pro Badminton',
    rate: '₹850',
    rating: '4.8',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcKwWMMbh89ChsaS4JHHypKe5vH9pi_X5iUWuCrbUm1MhTWwdKIJ7tjHcURVP3a28EQbWtQhhvGDubX9HgmHo1BSch0RQraNchbcY9uDCxJ_KGBfn6aw6A1jJRoG-Mobb1TyhauO7Tky670BptXO1sXfPTYLC6tuluyU5OZxi5jRrW7Ah3sbvvWtHxFe86Ct8-F8T7V1C0FyF35AJitiCRdTOtdti4Y6-VWpFOcYRP0KYI0_Ti4hRS3LBiOOl3o6KOSKYNk-aFbJw',
  },
]

export default function DiscoverPage() {
  return (
    <div className="bg-surface text-on-surface antialiased pb-28 min-h-screen">
      <TopBar variant="home" />

      <main className="mt-20 px-6 max-w-5xl mx-auto">

        {/* Editorial Hero */}
        <section className="py-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.05em] text-indigo-700 font-semibold mb-2 font-label">
              Empowering Local Talent
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight mb-6 font-headline">
              Master any skill,{' '}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                right in your neighborhood.
              </span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-zinc-400">search</span>
            </div>
            <input
              className="w-full h-16 pl-14 pr-36 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-lg font-medium placeholder:text-zinc-400 transition-all outline-none"
              placeholder="Find a skill (e.g., Badminton, Yoga)"
              type="text"
            />
            <button className="absolute right-3 top-3 bottom-3 px-6 bg-secondary text-white font-bold rounded-xl shadow-lg hover:scale-[0.98] transition-transform flex items-center gap-2">
              Search
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight font-headline">Popular Categories</h2>
            <a className="text-sm font-semibold text-primary hover:underline" href="#">View all</a>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-colors ${
                  cat.active
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                    : 'bg-white hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Recommended Experts */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight font-headline">Recommended Experts</h2>
              <p className="text-zinc-500 text-sm mt-1">Handpicked professionals in your city</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-white shadow-sm border border-zinc-100 hover:bg-indigo-50 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-full bg-white shadow-sm border border-zinc-100 hover:bg-indigo-50 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="bg-surface-container-lowest rounded-[24px] p-5 shadow-editorial group hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={expert.img}
                      alt={expert.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                      <span className="material-symbols-outlined text-[14px] icon-filled"
                        style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Expert</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface font-headline">{expert.name}</h3>
                        <p className="text-primary text-sm font-semibold">{expert.skill}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold">{expert.rating}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-zinc-400 text-xs uppercase font-bold tracking-widest block mb-1">Hourly Rate</span>
                        <span className="text-xl font-extrabold text-on-surface font-headline">{expert.rate}</span>
                      </div>
                      <Link
                        href={`/expert/${expert.id}`}
                        className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-colors"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Near You */}
        <section className="mb-20">
          <div className="relative rounded-[32px] overflow-hidden h-48 group">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB0pBl2wL5_lOGNgSxRM5AltW8fRzkqnv6WGPq_VGh8oGk3w4DZB-p8O2DOTeIUPBXRJGlSmGq15IKHcLbCYly0Ls9AYAJujtB70cbI-bVmZ8UZb4okqgOzxjtlYJWhzMdg-pbGoflRf30nxNKg10mI55f5y-s4aZ6knrmY3KZ2-aie3bAMybAyBdsxiMOKudm_QgnE6CTrF7kCfnEQ1H3rEF81WND61uER7WiK9Ek2-zde1bbgGwdPboYg2-PqcBXCxeI5ORdxjE"
              alt="Map"
              fill
              className="object-cover grayscale opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
              <div className="flex justify-between items-end w-full">
                <div>
                  <h3 className="text-white text-2xl font-bold font-headline">124 Experts nearby</h3>
                  <p className="text-indigo-100 text-sm">HSR Layout, Bangalore</p>
                </div>
                <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">map</span>
                  Explore Map
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <BottomNav mode="learner" />
    </div>
  )
}
