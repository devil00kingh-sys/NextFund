require('dotenv').config();
const { getDb, runQuery, getAll } = require('./setup');

async function seed() {
  await getDb();

  // ========== EVENTS ==========
  const events = [
    { title: "NXTFund Founder Meetup - Bengaluru", description: "An exclusive meetup for founders and investors to connect and collaborate.", date: "2026-08-20", time: "10:00 AM", location: "Bengaluru, India", type: "upcoming", image_url: "" },
    { title: "Webinar: Raising Capital in 2026", description: "Expert panel on fundraising trends, investor expectations and smarter pitches.", date: "2026-09-05", time: "4:00 PM", location: "Online", type: "upcoming", image_url: "" },
    { title: "NXTFund Demo Day", description: "Top startups pitch to investors and ecosystem partners.", date: "2026-09-18", time: "11:00 AM", location: "Mumbai, India", type: "upcoming", image_url: "" },
    { title: "Startup Weekend Jaipur", description: "54-hour event where aspiring entrepreneurs pitch, build and launch startups.", date: "2026-06-15", time: "9:00 AM", location: "Jaipur, India", type: "past", image_url: "" },
    { title: "AI in Startup Ecosystem Webinar", description: "Exploring how artificial intelligence is reshaping startup strategies and operations.", date: "2026-05-20", time: "3:00 PM", location: "Online", type: "past", image_url: "" },
  ];

  const existingEvents = getAll('SELECT COUNT(*) as count FROM events')[0]?.count || 0;
  if (existingEvents === 0) {
    for (const e of events) {
      runQuery('INSERT INTO events (title, description, date, time, location, type, image_url) VALUES (?,?,?,?,?,?,?)',
        [e.title, e.description, e.date, e.time, e.location, e.type, e.image_url]);
    }
    console.log(`Seeded ${events.length} events`);
  } else {
    console.log(`Events already exist (${existingEvents}), skipping...`);
  }

  // ========== BLOGS ==========
  const blogs = [
    { title: "The Next Decade of Global Innovation: Opportunities for Founders Everywhere", excerpt: "The world is entering a new era of innovation driven by technology, capital accessibility and a borderless entrepreneurial mindset.", content: "The world is entering a new era of innovation. Technology, capital accessibility and a borderless entrepreneurial mindset are reshaping how startups are built and scaled. Founders today have unprecedented access to global markets, talent and funding. This article explores the key opportunities that lie ahead for builders everywhere.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 08_48_29 PM.png", status: "published" },
    { title: "How to Build a Fundraising Strategy That Works in Any Market", excerpt: "Practical steps founders can take to prepare, position and raise capital successfully.", content: "Fundraising is both an art and a science. In any market condition, founders who understand investor psychology, prepare compelling narratives and demonstrate clear metrics have a higher chance of securing capital. Here are practical steps to build a fundraising strategy that works.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 10_24_19 AM.png", status: "published" },
    { title: "Emerging Startup Hubs Redefining the Global Innovation Map", excerpt: "A look at high-potential ecosystems outside traditional markets driving the next wave of startups.", content: "While Silicon Valley, London and Singapore remain dominant, a new wave of startup hubs is emerging across India, Latin America, Africa and Southeast Asia. These ecosystems offer unique advantages including talent density, market access and supportive government policies.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_17_39 PM.png", status: "published" },
    { title: "Key Trends in Venture Capital for 2025 and Beyond", excerpt: "Where capital is flowing, what investors are prioritizing and how founders can stay ahead.", content: "Venture capital is evolving rapidly. AI, climate tech, deeptech and healthtech are seeing increased allocation. Investors are prioritizing capital efficiency, clear unit economics and strong founder-market fit. Here are the key trends shaping VC in 2025 and beyond.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_09_37 PM.png", status: "published" },
    { title: "Founder Mindset: Building Resilience in an Uncertain World", excerpt: "Resilience is the ultimate competitive advantage for founders navigating challenges.", content: "The startup journey is inherently uncertain. Founders who cultivate resilience, adaptability and a growth mindset are better equipped to navigate setbacks and emerge stronger. This article explores practical strategies for building mental toughness.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_04_33 PM.png", status: "published" },
    { title: "Deep Tech Startups Solving Real-World Problems at Scale", excerpt: "How deep tech is addressing critical challenges and creating massive long-term impact.", content: "Deep tech startups are tackling some of the world's most pressing challenges, from climate change to healthcare accessibility. These companies leverage advanced technology and scientific research to build solutions with massive long-term impact.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_19_12 PM.png", status: "published" },
    { title: "Cross-Border Expansion: How Startups Can Go Global, Faster", excerpt: "Strategies for entering new markets, building local advantage and scaling sustainably.", content: "Going global is no longer optional for ambitious startups. This article covers strategies for market selection, localization, regulatory compliance and building local teams that enable rapid international expansion.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_15_55 PM.png", status: "published" },
    { title: "Why India is Building Startups for the World", excerpt: "India's startup ecosystem is maturing rapidly with globally competitive companies.", content: "India has emerged as the third-largest startup ecosystem in the world. With a massive talent pool, growing domestic market and increasing global ambitions, Indian startups are building solutions that serve markets worldwide.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_03_13 PM.png", status: "published" },
    { title: "The Rise of AI-Native Startups", excerpt: "How artificial intelligence is creating an entirely new category of startups.", content: "AI-native startups are building from the ground up with artificial intelligence at their core. Unlike traditional companies that add AI as a feature, these startups design their entire business model around AI capabilities.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Aug 29, 2026, 01_28_12 PM.png", status: "published" },
    { title: "Southeast Asia: The Next Growth Frontier", excerpt: "Southeast Asia offers massive opportunities for startups looking to scale.", content: "With a population of over 650 million and rapidly growing digital adoption, Southeast Asia represents one of the most exciting growth frontiers for startups. The region's diverse markets offer unique opportunities across fintech, e-commerce and healthtech.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 08_48_29 PM.png", status: "published" },
    { title: "Building Strong Board Relationships", excerpt: "How founders can effectively manage and leverage their board of directors.", content: "A strong board can be a startup's greatest asset. This article explores how founders can build productive relationships with board members, run effective meetings and leverage board expertise for strategic advantage.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 10_28_58 AM.png", status: "published" },
    { title: "Climate Tech: Investing in a Sustainable Future", excerpt: "The growing opportunity in climate technology and sustainable innovation.", content: "Climate tech is attracting unprecedented levels of investment as the world addresses climate change. From renewable energy to carbon capture, startups in this space are building solutions that are both environmentally impactful and commercially viable.", author: "NXTFund Team", image_url: "assets/images/pages/blog/ChatGPT Image Sep 1, 2026, 09_19_12 PM.png", status: "published" },
  ];

  const existingBlogs = getAll('SELECT COUNT(*) as count FROM blogs')[0]?.count || 0;
  if (existingBlogs === 0) {
    for (const b of blogs) {
      runQuery('INSERT INTO blogs (title, excerpt, content, author, image_url, status) VALUES (?,?,?,?,?,?)',
        [b.title, b.excerpt, b.content, b.author, b.image_url, b.status]);
    }
    console.log(`Seeded ${blogs.length} blogs`);
  } else {
    console.log(`Blogs already exist (${existingBlogs}), skipping...`);
  }

  // ========== STARTUPS ==========
  const startups = [
    { name: "ANTELLAY Space", description: "AI-native intelligence and infrastructure for the next generation of space operations.", sector: "SpaceTech, AI", website: "", status: "active" },
    { name: "Volimy", description: "An emerging technology venture building intelligent digital solutions.", sector: "Technology, AI", website: "", status: "active" },
    { name: "Byizon.ai", description: "AI-powered technology solutions designed to simplify and accelerate modern business.", sector: "AI, SaaS", website: "", status: "active" },
    { name: "Grehni.ai", description: "An emerging AI venture focused on intelligent digital experiences and automation.", sector: "AI, Technology", website: "", status: "active" },
    { name: "Numerixx.ai", description: "An AI-driven predictive intelligence platform combining data, mathematics and intelligent insights.", sector: "AI, Predictive Intelligence", website: "", status: "active" },
    { name: "UncoverdDeals", description: "A discovery platform helping users uncover products, deals and opportunities.", sector: "Consumer, Technology", website: "", status: "active" },
    { name: "ANTELLAY-X.io", description: "An experimental technology venture focused on next-generation digital and intelligent infrastructure.", sector: "DeepTech, Technology", website: "", status: "active" },
    { name: "NuroPay", description: "Digital payments infrastructure for emerging markets.", sector: "FinTech, Payments Infrastructure", website: "", status: "active" },
    { name: "Kryptone", description: "Advanced security solutions for Web3 applications and protocols.", sector: "Web3, Security", website: "", status: "active" },
    { name: "Lumina AI", description: "AI-powered analytics platform for enterprises.", sector: "AI, Enterprise", website: "", status: "active" },
    { name: "AgriSense", description: "Smart farming solutions using IoT and predictive analytics.", sector: "AgriTech, IoT", website: "", status: "active" },
    { name: "MediTrack", description: "Hospital management software simplifying healthcare operations.", sector: "HealthTech, SaaS", website: "", status: "active" },
    { name: "Voltx", description: "Next-gen energy storage solutions for a sustainable future.", sector: "CleanTech, Energy", website: "", status: "active" },
    { name: "DataHive", description: "Unified data platform for real-time business intelligence.", sector: "SaaS, Data Intelligence", website: "", status: "active" },
    { name: "RoboStack", description: "Robotics automation for industrial and warehouse operations.", sector: "DeepTech, Robotics", website: "", status: "active" },
    { name: "EduSphere", description: "AI-driven learning platform for modern education.", sector: "EdTech, SaaS", website: "", status: "active" },
  ];

  const existingStartups = getAll('SELECT COUNT(*) as count FROM startups')[0]?.count || 0;
  if (existingStartups === 0) {
    for (const s of startups) {
      runQuery('INSERT INTO startups (name, description, sector, website, status) VALUES (?,?,?,?,?)',
        [s.name, s.description, s.sector, s.website, s.status]);
    }
    console.log(`Seeded ${startups.length} startups`);
  } else {
    console.log(`Startups already exist (${existingStartups}), skipping...`);
  }

  // ========== PARTNERS ==========
  const partners = [
    { name: "Amazon Web Services", description: "Powering startups with secure, scalable and reliable cloud infrastructure.", category: "Corporate", website: "", logo_url: "https://logo.clearbit.com/aws.amazon.com" },
    { name: "Microsoft", description: "Empowering startups with world-class technology and developer tools.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 1, 2026, 10_01_54 AM.png" },
    { name: "Antler", description: "Backing early-stage founders and helping them build global companies.", category: "VCs", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 1, 2026, 10_03_41 AM.png" },
    { name: "Stripe", description: "Enabling startups to accept payments and manage revenue globally.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 1, 2026, 10_04_23 AM.png" },
    { name: "HubSpot", description: "Helping startups grow better with CRM, marketing and automation tools.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 1, 2026, 10_07_02 AM.png" },
    { name: "Slack", description: "Bringing teams and tools together to build and ship faster.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 1, 2026, 10_08_53 AM.png" },
    { name: "Amazon", description: "Supporting startups with scalable technology and digital infrastructure.", category: "Corporate", website: "", logo_url: "https://logo.clearbit.com/amazon.com" },
    { name: "Google", description: "Helping startups build, scale and innovate with Google's technology ecosystem.", category: "Corporate", website: "", logo_url: "https://logo.clearbit.com/google.com" },
    { name: "Zoho", description: "Empowering startups with business software and productivity solutions.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_12_03 PM.png" },
    { name: "WhatsApp", description: "Helping businesses connect with customers through messaging.", category: "Corporate", website: "", logo_url: "https://logo.clearbit.com/whatsapp.com" },
    { name: "AllEvents", description: "Connecting founders and communities through events and experiences.", category: "Accelerators", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_02_02 PM.png" },
    { name: "IDFC FIRST Bank", description: "Supporting entrepreneurs and businesses with modern financial solutions.", category: "Corporate", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_03_34 PM.png" },
    { name: "Startup Chaupal", description: "Connecting founders, investors and ecosystem stakeholders.", category: "Accelerators", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_06_13 PM.png" },
    { name: "Marwari Catalysts", description: "Supporting high-potential startups through investment and mentorship.", category: "Advisors", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_08_09 PM.png" },
    { name: "iStart Rajasthan", description: "Supporting Rajasthan's startup ecosystem through incubation and mentorship.", category: "Accelerators", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_08_56 PM.png" },
    { name: "Fluid Ventures", description: "Supporting emerging startups with capital and strategic guidance.", category: "VCs", website: "", logo_url: "assets/images/pages/partners/ChatGPT Image Sep 4, 2026, 12_04_21 PM.png" },
  ];

  const existingPartners = getAll('SELECT COUNT(*) as count FROM partners')[0]?.count || 0;
  if (existingPartners === 0) {
    for (const p of partners) {
      runQuery('INSERT INTO partners (name, description, category, website, logo_url) VALUES (?,?,?,?,?)',
        [p.name, p.description, p.category, p.website, p.logo_url]);
    }
    console.log(`Seeded ${partners.length} partners`);
  } else {
    console.log(`Partners already exist (${existingPartners}), skipping...`);
  }

  // ========== SAMPLE APPLICATIONS ==========
  const applications = [
    { founder_name: "Priya Sharma", founder_email: "priya@example.com", founder_linkedin: "linkedin.com/in/priyasharma", founder_role: "CEO & Co-Founder", company_name: "HealthBridge AI", company_description: "AI-powered health diagnostics for rural India", company_url: "healthbridge.ai", company_location: "Jaipur, India", stage: "MVP", monthly_expenses: "500000", monthly_revenue: "100000", active_users: "500", product_description: "AI health diagnostics platform", motivation: "Healthcare accessibility in rural areas", novelty: "AI-first approach to diagnostics", competitors: "Practo, 1mg", unique_insight: "Focus on tier-2 and tier-3 cities", business_model: "SaaS + Freemium", incorporated: "Yes", incorporation_location: "India", equity_split: "80-20", past_funding: "None", requested_amount: "50 Lakhs", batch_preference: "Q1 2027", status: "pending" },
    { founder_name: "Rahul Verma", founder_email: "rahul@example.com", founder_linkedin: "linkedin.com/in/rahulverma", founder_role: "CTO", company_name: "AgriBot", company_description: "IoT-based smart farming automation system", company_url: "agribot.io", company_location: "Delhi, India", stage: "Beta", monthly_expenses: "800000", monthly_revenue: "200000", active_users: "1200", product_description: "IoT sensors + dashboard for farmers", motivation: "Modernizing Indian agriculture", novelty: "Affordable IoT hardware", competitors: "CropIn, Fasal", unique_insight: "Hardware + Software bundle", business_model: "Hardware + Subscription", incorporated: "Yes", incorporation_location: "India", equity_split: "70-30", past_funding: "Angel Round - 20 Lakhs", requested_amount: "1 Crore", batch_preference: "Q2 2027", status: "approved" },
    { founder_name: "Ananya Gupta", founder_email: "ananya@example.com", founder_linkedin: "linkedin.com/in/ananyagupta", founder_role: "Founder & CEO", company_name: "EduNxt", company_description: "Personalized AI tutoring platform for K-12 students", company_url: "edunxt.in", company_location: "Mumbai, India", stage: "Revenue", monthly_expenses: "1200000", monthly_revenue: "600000", active_users: "5000", product_description: "AI tutoring with adaptive learning paths", motivation: "Quality education for every child", novelty: "Multilingual AI tutor", competitors: "BYJU'S, Unacademy", unique_insight: "Regional language support", business_model: "Subscription", incorporated: "Yes", incorporation_location: "India", equity_split: "85-15", past_funding: "Pre-Seed - 10 Lakhs", requested_amount: "75 Lakhs", batch_preference: "Q1 2027", status: "pending" },
  ];

  const existingApps = getAll('SELECT COUNT(*) as count FROM applications')[0]?.count || 0;
  if (existingApps === 0) {
    for (const a of applications) {
      runQuery(`INSERT INTO applications (founder_name, founder_email, founder_linkedin, founder_role, company_name, company_description, company_url, company_location, stage, monthly_expenses, monthly_revenue, active_users, product_description, motivation, novelty, competitors, unique_insight, business_model, incorporated, incorporation_location, equity_split, past_funding, requested_amount, batch_preference, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [a.founder_name, a.founder_email, a.founder_linkedin, a.founder_role, a.company_name, a.company_description, a.company_url, a.company_location, a.stage, a.monthly_expenses, a.monthly_revenue, a.active_users, a.product_description, a.motivation, a.novelty, a.competitors, a.unique_insight, a.business_model, a.incorporated, a.incorporation_location, a.equity_split, a.past_funding, a.requested_amount, a.batch_preference, a.status]);
    }
    console.log(`Seeded ${applications.length} sample applications`);
  } else {
    console.log(`Applications already exist (${existingApps}), skipping...`);
  }

  // ========== SAMPLE CONTACTS ==========
  const contacts = [
    { name: "Vikash Kumar", email: "vikash@example.com", subject: "Partnership Inquiry", message: "Hi, I am interested in partnering with NXTFund for our accelerator program. We support 50+ startups annually.", status: "unread" },
    { name: "Sneha Patel", email: "sneha@example.com", subject: "Investment Opportunity", message: "I am a founder building a fintech solution for SMBs. Would love to discuss funding opportunities.", status: "read" },
    { name: "Amit Singh", email: "amit@techcorp.com", subject: "Corporate Partnership", message: "Our company TechCorp would like to explore strategic partnership opportunities with NXTFund.", status: "replied" },
  ];

  const existingContacts = getAll('SELECT COUNT(*) as count FROM contacts')[0]?.count || 0;
  if (existingContacts === 0) {
    for (const c of contacts) {
      runQuery('INSERT INTO contacts (name, email, subject, message, status) VALUES (?,?,?,?,?)',
        [c.name, c.email, c.subject, c.message, c.status]);
    }
    console.log(`Seeded ${contacts.length} sample contacts`);
  } else {
    console.log(`Contacts already exist (${existingContacts}), skipping...`);
  }

  console.log('\nDatabase seeded successfully!');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
