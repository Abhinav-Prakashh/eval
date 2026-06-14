import { useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeader() {
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

const CURRICULUM = {
  6: {
    "Mathematics": [
      "Knowing Our Numbers", "Whole Numbers", "Playing with Numbers", "Basic Geometrical Ideas",
      "Understanding Elementary Shapes", "Integers", "Fractions", "Decimals",
      "Data Handling", "Mensuration", "Algebra", "Ratio and Proportion", "Symmetry", "Practical Geometry"
    ],
    "Science": [
      "Food: Where Does It Come From?", "Components of Food", "Fibre to Fabric",
      "Sorting Materials into Groups", "Separation of Substances", "Changes Around Us",
      "Getting to Know Plants", "Body Movements", "The Living Organisms and Their Surroundings",
      "Motion and Measurement of Distances", "Light, Shadows and Reflections",
      "Electricity and Circuits", "Fun with Magnets", "Water", "Air Around Us", "Garbage In, Garbage Out"
    ],
    "Social Science": [
      "What, Where, How and When?", "On The Trial of the Earliest People", "From Gathering to Growing Food",
      "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic",
      "New Questions and Ideas", "Ashoka, the Emperor Who Gave Up War", "Vital Villages, Thriving Towns",
      "Traders, Kings and Pilgrims", "New Empires and Kingdoms", "Buildings, Paintings and Books",
      "The Earth in the Solar System", "Globe: Latitudes and Longitudes", "Motions of the Earth",
      "Maps", "Major Domains of the Earth", "Major Landforms of the Earth",
      "Our Country India", "India: Climate, Vegetation and Wildlife",
      "Understanding Diversity", "Diversity and Discrimination", "What is Government?",
      "Key Elements of a Democratic Government", "Panchayati Raj", "Rural Administration",
      "Urban Administration", "Rural Livelihoods", "Urban Livelihoods"
    ],
    "English": [
      "Who Did Patrick's Homework?", "How the Dog Found Himself a New Master!", "Taro's Reward",
      "An Indian American Woman in Space", "A Different Kind of School", "Who I Am",
      "Fair Play", "A Game of Chance", "Desert Animals", "The Banyan Tree",
      "A Tale of Two Birds", "The Friendly Mongoose", "The Shepherd's Treasure",
      "The Old Clock Shop", "Tansen", "The Monkey and the Crocodile",
      "The Wonder Called Sleep", "A Pact with the Sun", "What Happened to the Reptiles",
      "A Strange Wrestling Match"
    ],
    "Hindi": [
      "वह चिड़िया जो", "बचपन", "नादान दोस्त", "चाँद से थोड़ी सी गप्पें",
      "अक्षरों का महत्व", "पार नज़र के", "साथी हाथ बढ़ाना", "ऐसे–ऐसे",
      "टिकट अलबम", "झाँसी की रानी", "जो देखकर भी नहीं देखते", "संसार पुस्तक है",
      "मैं सबसे छोटी होऊं", "लोकगीत", "नौकर", "वन के मार्ग में", "साँस–साँस में बाँस"
    ]
  },
  7: {
    "Mathematics": [
      "Integers", "Fractions and Decimals", "Data Handling", "Simple Equations",
      "Lines and Angles", "The Triangle and its Properties", "Congruence of Triangles",
      "Comparing Quantities", "Rational Numbers", "Practical Geometry",
      "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers",
      "Symmetry", "Visualising Solid Shapes"
    ],
    "Science": [
      "Nutrition in Plants", "Nutrition in Animals", "Fibre to Fabric", "Heat",
      "Acids, Bases and Salts", "Physical and Chemical Changes", "Weather, Climate and Adaptations",
      "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms",
      "Transportation in Animals and Plants", "Reproduction in Plants",
      "Motion and Time", "Electric Current and its Effects", "Light",
      "Water: A Precious Resource", "Forests: Our Lifeline", "Wastewater Story"
    ],
    "Social Science": [
      "Tracing Changes Through a Thousand Years", "New Kings and Kingdoms", "The Delhi Sultans",
      "The Mughal Empire", "Rulers and Buildings", "Towns, Traders and Craftspersons",
      "Tribes, Nomads and Settled Communities", "Devotional Paths to the Divine",
      "The Making of Regional Cultures", "Eighteenth-Century Political Formations",
      "Environment", "Inside Our Earth", "Our Changing Earth", "Air", "Water",
      "Natural Vegetation and Wildlife", "Human Environment – Settlement, Transport and Communication",
      "Human Environment Interactions", "Life in the Temperate Grasslands", "Life in the Deserts",
      "On Equality", "Role of the Government in Health", "How the State Government Works",
      "Growing up as Boys and Girls", "Women Change the World", "Understanding Media",
      "Markets Around Us", "A Shirt in the Market"
    ],
    "English": [
      "Three Questions", "A Gift of Chappals", "Gopal and the Hilsa Fish", "The Ashes That Made Trees Bloom",
      "Quality", "Expert Detectives", "The Invention of Vita Wonk", "Fire: Friend and Foe",
      "A Bicycle in Good Repair", "The Story of Cricket",
      "The Squirrel", "The Rebel", "The Shed", "Chivvy", "Trees", "Mystery of the Talking Fan",
      "Dad and the Cat and the Tree", "Meadow Surprises", "Garden Snake"
    ],
    "Hindi": [
      "हम पंछी उन्मुक्त गगन के", "दादी माँ", "हिमालय की बेटियाँ", "कठपुतली",
      "मिठाईवाला", "रक्त और हमारा शरीर", "पापा खो गए", "शाम–एक किसान",
      "चिड़िया की बच्ची", "अपूर्व अनुभव", "रहीम के दोहे", "कंचा",
      "एक तिनका", "खानपान की बदलती तस्वीर", "नीलकंठ", "भोर और बरखा",
      "वीर कुँवर सिंह", "संघर्ष के कारण मैं तुनकमिज़ाज हो गया", "आश्रम का अनुमानित व्यय", "विप्लव-गायन"
    ]
  },
  8: {
    "Mathematics": [
      "Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals",
      "Practical Geometry", "Data Handling", "Squares and Square Roots",
      "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions and Identities",
      "Visualising Solid Shapes", "Mensuration", "Exponents and Powers",
      "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs",
      "Playing with Numbers"
    ],
    "Science": [
      "Crop Production and Management", "Microorganisms: Friend and Foe",
      "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals",
      "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals",
      "Cell Structure and Functions", "Reproduction in Animals",
      "Reaching the Age of Adolescence", "Force and Pressure", "Friction",
      "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena",
      "Light", "Stars and the Solar System", "Pollution of Air and Water"
    ],
    "Social Science": [
      "How, When and Where", "From Trade to Territory", "Ruling the Countryside",
      "Tribals, Dikus and the Vision of a Golden Age", "When People Rebel",
      "Weavers, Iron Smelters and Factory Owners", "Civilising the Native, Educating the Nation",
      "Women, Caste and Reform", "The Making of the National Movement",
      "India After Independence", "Resources", "Land, Soil, Water, Natural Vegetation and Wildlife",
      "Mineral and Power Resources", "Agriculture", "Industries",
      "Human Resources", "The Indian Constitution", "Understanding Secularism",
      "Why Do We Need a Parliament?", "Understanding Laws", "Judiciary",
      "Understanding Our Criminal Justice System", "Understanding Marginalisation",
      "Confronting Marginalisation", "Public Facilities", "Law and Social Justice"
    ],
    "English": [
      "The Best Christmas Present in the World", "The Tsunami", "Glimpses of the Past",
      "Bepin Choudhury's Lapse of Memory", "The Summit Within", "This is Jody's Fawn",
      "A Visit to Cambridge", "A Short Monsoon Diary", "The Great Stone Face I", "The Great Stone Face II",
      "The Ant and the Cricket", "Geography Lesson", "Macavity: The Mystery Cat",
      "The Last Bargain", "The School Boy", "The Duck and the Kangaroo",
      "When I Set Out for Lyonnesse", "On the Grasshopper and Cricket"
    ],
    "Hindi": [
      "ध्वनि", "लाख की चूड़ियाँ", "बस की यात्रा", "दीवानों की हस्ती",
      "चिट्ठियों की अनूठी दुनिया", "भगवान के डाकिए", "क्या निराश हुआ जाए",
      "यह सबसे कठिन समय नहीं", "कबीर की साखियाँ", "कामचोर",
      "जब सिनेमा ने बोलना सीखा", "सुदामा चरित", "जहाँ पहिया है", "अकबरी लोटा",
      "सूरदास के पद", "पानी की कहानी", "बाज और साँप", "टोपी"
    ]
  },
  9: {
    "Mathematics": [
      "Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables",
      "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals",
      "Areas of Parallelograms and Triangles", "Circles", "Constructions",
      "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"
    ],
    "Science": [
      "Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules",
      "Structure of the Atom", "The Fundamental Unit of Life", "Tissues",
      "Diversity in Living Organisms", "Motion", "Force and Laws of Motion", "Gravitation",
      "Work and Energy", "Sound", "Why Do We Fall Ill?", "Natural Resources",
      "Improvement in Food Resources"
    ],
    "Social Science": [
      "The French Revolution", "Socialism in Europe and the Russian Revolution",
      "Nazism and the Rise of Hitler", "Forest Society and Colonialism",
      "Pastoralists in the Modern World", "Peasants and Farmers",
      "History and Sport: The Story of Cricket", "Clothes: A Social History",
      "India – Size and Location", "Physical Features of India", "Drainage", "Climate",
      "Natural Vegetation and Wildlife", "Population",
      "What is Democracy? Why Democracy?", "Constitutional Design",
      "Electoral Politics", "Working of Institutions", "Democratic Rights",
      "The Story of Village Palampur", "People as Resource",
      "Poverty as a Challenge", "Food Security in India"
    ],
    "English": [
      "The Fun They Had", "The Sound of Music", "The Little Girl", "A Truly Beautiful Mind",
      "The Snake and the Mirror", "My Childhood", "Packing", "Reach for the Top",
      "The Bond of Love", "Kathmandu", "If I Were You",
      "The Road Not Taken", "Wind", "Rain on the Roof", "The Lake Isle of Innisfree",
      "A Legend of the Northland", "No Men Are Foreign", "The Duck and the Kangaroo",
      "On Killing a Tree", "The Snake Trying", "A Slumber Did My Spirit Seal"
    ],
    "Physics": ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"],
    "Chemistry": ["Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules", "Structure of the Atom"],
    "Biology": ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why Do We Fall Ill?", "Natural Resources", "Improvement in Food Resources"],
    "Hindi": [
      "दो बैलों की कथा", "ल्हासा की ओर", "उपभोक्तावाद की संस्कृति", "साँवले सपनों की याद",
      "नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया", "प्रेमचंद के फटे जूते",
      "मेरे बचपन के दिन", "एक कुत्ता और एक मैना", "इस जल प्रलय में", "मेरे संग की औरतें",
      "रीढ़ की हड्डी", "माटी वाली", "किस तरह आखिरकार मैं हिंदी में आया",
      "सखियाँ एवं सबद", "वाख", "सवैये", "कैदी और कोकिला",
      "ग्राम श्री", "चंद्र गहना से लौटती बेर", "मेघ आए", "यमराज की दिशा", "बच्चे काम पर जा रहे हैं"
    ],
    "Sanskrit": [
      "भारतीवसन्तगीतिः", "स्वर्णकाकः", "गोदोहनम्", "कल्पतरूः",
      "सूक्तिमौक्तिकम्", "भ्रान्तो बालः", "प्रत्यभिज्ञानम्", "लौहतुला",
      "सिकतासेतुः", "जटायोः शौर्यम्", "पर्यावरणम्", "अनारिकायाः जिज्ञासा", "चन्द्रशेखर आजाद"
    ]
  },
  10: {
    "Mathematics": [
      "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables",
      "Quadratic Equations", "Arithmetic Progressions", "Triangles",
      "Coordinate Geometry", "Introduction to Trigonometry",
      "Some Applications of Trigonometry", "Circles", "Constructions",
      "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"
    ],
    "Science": [
      "Chemical Reactions and Equations", "Acids, Bases and Salts",
      "Metals and Non-metals", "Carbon and its Compounds",
      "Periodic Classification of Elements", "Life Processes",
      "Control and Coordination", "How do Organisms Reproduce?",
      "Heredity and Evolution", "Light – Reflection and Refraction",
      "Human Eye and Colourful World", "Electricity",
      "Magnetic Effects of Electric Current", "Sources of Energy",
      "Our Environment", "Management of Natural Resources"
    ],
    "Social Science": [
      "The Rise of Nationalism in Europe", "Nationalism in India",
      "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World",
      "Resources and Development", "Forest and Wildlife Resources",
      "Water Resources", "Agriculture", "Minerals and Energy Resources",
      "Manufacturing Industries", "Lifelines of National Economy",
      "Power Sharing", "Federalism", "Democracy and Diversity",
      "Gender, Religion and Caste", "Popular Struggles and Movements",
      "Political Parties", "Outcomes of Democracy", "Challenges to Democracy",
      "Development", "Sectors of the Indian Economy",
      "Money and Credit", "Globalisation and the Indian Economy", "Consumer Rights"
    ],
    "English": [
      "A Letter to God", "Nelson Mandela: Long Walk to Freedom", "Two Stories about Flying",
      "From the Diary of Anne Frank", "The Hundred Dresses I", "The Hundred Dresses II",
      "Glimpses of India", "Mijbil the Otter", "Madam Rides the Bus",
      "The Sermon at Benares", "The Proposal",
      "Dust of Snow", "Fire and Ice", "A Tiger in the Zoo", "How to Tell Wild Animals",
      "The Ball Poem", "Amanda!", "Animals", "The Trees", "Fog", "The Tale of Custard the Dragon",
      "For Anne Gregory", "A Triumph of Surgery", "The Thief's Story", "The Midnight Visitor",
      "A Question of Trust", "Footprints without Feet", "The Making of a Scientist",
      "The Necklace", "Bholi", "The Book That Saved the Earth"
    ],
    "Physics": ["Light – Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"],
    "Chemistry": ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"],
    "Biology": ["Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Our Environment", "Management of Natural Resources"],
    "Hindi": [
      "सूरदास के पद", "तुलसीदास के दोहे", "देव", "जयशंकर प्रसाद", "सूर्यकांत त्रिपाठी निराला",
      "नागार्जुन", "गिरिजाकुमार माथुर", "ऋतुराज", "मंगलेश डबराल",
      "नेताजी का चश्मा", "बालगोबिन भगत", "लखनवी अंदाज़",
      "एक कहानी यह भी", "स्त्री शिक्षा के विरोधी कुतर्कों का खंडन",
      "नौबतखाने में इबादत", "संस्कृति", "माता का आँचल", "जॉर्ज पंचम की नाक",
      "साना साना हाथ जोड़ि", "एही ठैयाँ झुलनी हेरानी हो रामा!", "मैं क्यों लिखता हूँ?"
    ],
    "Sanskrit": [
      "शुचिपर्यावरणम्", "बुद्धिर्बलवती सदा", "व्यायामः सर्वदा पथ्यः", "शिशुलालनम्",
      "जननी तुल्यवत्सला", "सुभाषितानि", "सौहार्दं प्रकृतेः शोभा", "विचित्रः साक्षी",
      "सूक्तयः", "भूकम्पविभीषिका", "प्राणेभ्योऽपि प्रियः सुह्रद्", "अनयोक्त्यः"
    ]
  },
  11: {
    "Physics": [
      "Physical World", "Units and Measurements", "Motion in a Straight Line",
      "Motion in a Plane", "Laws of Motion", "Work, Energy and Power",
      "System of Particles and Rotational Motion", "Gravitation",
      "Mechanical Properties of Solids", "Mechanical Properties of Fluids",
      "Thermal Properties of Matter", "Thermodynamics",
      "Kinetic Theory", "Oscillations", "Waves"
    ],
    "Chemistry": [
      "Some Basic Concepts of Chemistry", "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure", "States of Matter",
      "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen",
      "The s-Block Elements", "The p-Block Elements", "Organic Chemistry: Basic Principles",
      "Hydrocarbons", "Environmental Chemistry"
    ],
    "Biology": [
      "The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom",
      "Morphology of Flowering Plants", "Anatomy of Flowering Plants",
      "Structural Organisation in Animals", "Cell: The Unit of Life",
      "Biomolecules", "Cell Cycle and Cell Division",
      "Transport in Plants", "Mineral Nutrition", "Photosynthesis in Higher Plants",
      "Respiration in Plants", "Plant Growth and Development",
      "Digestion and Absorption", "Breathing and Exchange of Gases",
      "Body Fluids and Circulation", "Excretory Products and their Elimination",
      "Locomotion and Movement", "Neural Control and Coordination",
      "Chemical Coordination and Integration"
    ],
    "Mathematics": [
      "Sets", "Relations and Functions", "Trigonometric Functions",
      "Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations",
      "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem",
      "Sequences and Series", "Straight Lines", "Conic Sections",
      "Introduction to Three Dimensional Geometry", "Limits and Derivatives",
      "Mathematical Reasoning", "Statistics", "Probability"
    ],
    "English": [
      "The Portrait of a Lady", "We're Not Afraid to Die", "Discovering Tut: the Saga Continues",
      "Landscape of the Soul", "The Ailing Planet: the Green Movement's Role",
      "The Browning Version", "The Adventure", "Silk Road",
      "A Photograph", "The Laburnum Top", "The Voice of the Rain", "Childhood",
      "Father to Son", "The Summer of the Beautiful White Horse",
      "The Address", "Ranga's Marriage", "Albert Einstein at School",
      "Mother's Day", "The Ghat of the Only World", "Birth", "The Tale of Melon City"
    ],
    "Accountancy": [
      "Introduction to Accounting", "Theory Base of Accounting",
      "Recording of Transactions I", "Recording of Transactions II",
      "Bank Reconciliation Statement", "Trial Balance and Rectification of Errors",
      "Depreciation, Provisions and Reserves", "Bill of Exchange",
      "Financial Statements I", "Financial Statements II",
      "Accounts from Incomplete Records", "Applications of Computers in Accounting",
      "Computerised Accounting System"
    ],
    "Business Studies": [
      "Nature and Purpose of Business", "Forms of Business Organisation",
      "Private, Public and Global Enterprises", "Business Services",
      "Emerging Modes of Business", "Social Responsibility of Business and Business Ethics",
      "Formation of a Company", "Sources of Business Finance",
      "Small Business", "Internal Trade", "International Business"
    ],
    "Economics": [
      "Introduction to Statistics", "Collection of Data", "Organisation of Data",
      "Presentation of Data", "Measures of Central Tendency",
      "Measures of Dispersion", "Correlation", "Index Numbers",
      "Introduction to Indian Economy", "Indian Economy on the Eve of Independence",
      "Economic Development: Liberalisation, Privatisation, Globalisation",
      "Poverty", "Human Capital Formation in India", "Rural Development",
      "Employment: Growth, Informalisation and Other Issues",
      "Infrastructure", "Environment and Sustainable Development",
      "Comparative Development Experiences of India with its Neighbours"
    ],
    "History": [
      "From the Beginning of Time", "Early Cities", "An Empire Across Three Continents",
      "The Central Islamic Lands", "Nomadic Empires", "The Three Orders",
      "Changing Cultural Traditions", "Confrontation of Cultures",
      "The Industrial Revolution", "Displacing Indigenous Peoples",
      "Paths to Modernisation"
    ],
    "Geography": [
      "Geography as a Discipline", "The Origin and Evolution of the Earth",
      "Interior of the Earth", "Distribution of Oceans and Continents",
      "Minerals and Rocks", "Geomorphic Processes", "Landforms and their Evolution",
      "Composition and Structure of Atmosphere", "Solar Radiation, Heat Balance and Temperature",
      "Atmospheric Circulation and Weather Systems", "Water in the Atmosphere",
      "World Climate and Climate Change", "Water (Oceans)", "Movements of Ocean Water",
      "Life on the Earth", "Biodiversity and Conservation",
      "India – Location", "Structure and Physiography", "Drainage System",
      "Climate", "Natural Vegetation", "Soils", "Natural Hazards and Disasters"
    ],
    "Political Science": [
      "Political Theory: An Introduction", "Freedom", "Equality", "Social Justice",
      "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development",
      "Constitution: Why and How?", "Rights in the Indian Constitution",
      "Election and Representation", "Executive", "Legislature",
      "Judiciary", "Federalism", "Local Governments",
      "Constitution as a Living Document", "The Philosophy of the Constitution"
    ]
  },
  12: {
    "Physics": [
      "Electric Charges and Fields", "Electrostatic Potential and Capacitance",
      "Current Electricity", "Moving Charges and Magnetism",
      "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current",
      "Electromagnetic Waves", "Ray Optics and Optical Instruments",
      "Wave Optics", "Dual Nature of Radiation and Matter",
      "Atoms", "Nuclei", "Semiconductor Electronics", "Communication Systems"
    ],
    "Chemistry": [
      "The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics",
      "Surface Chemistry", "General Principles and Processes of Isolation of Elements",
      "The p-Block Elements", "The d and f Block Elements",
      "Coordination Compounds", "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids",
      "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"
    ],
    "Biology": [
      "Reproduction in Organisms", "Sexual Reproduction in Flowering Plants",
      "Human Reproduction", "Reproductive Health",
      "Principles of Inheritance and Variation", "Molecular Basis of Inheritance",
      "Evolution", "Human Health and Disease",
      "Strategies for Enhancement in Food Production",
      "Microbes in Human Welfare", "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications", "Organisms and Populations",
      "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"
    ],
    "Mathematics": [
      "Relations and Functions", "Inverse Trigonometric Functions", "Matrices",
      "Determinants", "Continuity and Differentiability", "Application of Derivatives",
      "Integrals", "Application of Integrals", "Differential Equations",
      "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability"
    ],
    "English": [
      "The Last Lesson", "Lost Spring", "Deep Water", "The Rattrap",
      "Indigo", "Poets and Pancakes", "The Interview", "Going Places",
      "My Mother at Sixty-Six", "An Elementary School Classroom in a Slum",
      "Keeping Quiet", "A Thing of Beauty", "A Roadside Stand", "Aunt Jennifer's Tigers",
      "Third Level", "The Tiger King", "The Enemy", "On the Face of It",
      "Memories of Childhood", "The Cutting of My Long Hair", "We Too Are Human Beings"
    ],
    "Accountancy": [
      "Accounting for Partnership: Basic Concepts",
      "Change in Profit Sharing Ratio Among the Existing Partners",
      "Admission of a Partner", "Retirement and Death of a Partner",
      "Dissolution of Partnership Firm",
      "Accounting for Share Capital", "Issue and Redemption of Debentures",
      "Financial Statements of a Company",
      "Analysis of Financial Statements", "Accounting Ratios", "Cash Flow Statement"
    ],
    "Business Studies": [
      "Nature and Significance of Management", "Principles of Management",
      "Business Environment", "Planning", "Organising",
      "Staffing", "Directing", "Controlling",
      "Financial Management", "Financial Markets",
      "Marketing Management", "Consumer Protection", "Entrepreneurship Development"
    ],
    "Economics": [
      "Introduction to Macroeconomics", "National Income Accounting",
      "Money and Banking", "Determination of Income and Employment",
      "Government Budget and the Economy", "Open Economy Macroeconomics",
      "Introduction to Microeconomics", "Theory of Consumer Behaviour",
      "Production and Costs", "The Theory of the Firm Under Perfect Competition",
      "Market Equilibrium", "Non-competitive Markets"
    ],
    "History": [
      "Bricks, Beads and Bones: The Harappan Civilisation",
      "Kings, Farmers and Towns: Early States and Economies",
      "Kinship, Caste and Class: Early Societies",
      "Thinkers, Beliefs and Buildings: Cultural Developments",
      "Through the Eyes of Travellers: Perceptions of Society",
      "Bhakti-Sufi Traditions: Changes in Religious Beliefs",
      "An Imperial Capital: Vijayanagara",
      "Peasants, Zamindars and the State: Agrarian Society",
      "Kings and Chronicles: The Mughal Courts",
      "Colonialism and the Countryside: Exploring Official Archives",
      "Rebels and the Raj: The 1857 Revolt",
      "Colonial Cities: Urbanisation, Planning and Architecture",
      "Mahatma Gandhi and the Nationalist Movement",
      "Understanding Partition: Politics, Memories, Experiences",
      "Framing the Constitution: The Beginning of a New Era"
    ],
    "Geography": [
      "Human Geography: Nature and Scope", "The World Population: Distribution, Density and Growth",
      "Population Composition", "Human Development",
      "Primary Activities", "Secondary Activities", "Tertiary and Quaternary Activities",
      "Transport and Communication", "International Trade",
      "Human Settlements", "Population: Distribution, Density, Growth and Composition",
      "Migration: Types, Causes and Consequences", "Human Development",
      "Human Settlements", "Land Resources and Agriculture", "Water Resources",
      "Mineral and Energy Resources", "Manufacturing Industries",
      "Planning and Sustainable Development", "Transport and Communication",
      "International Trade", "Geographical Perspective on Selected Issues"
    ],
    "Political Science": [
      "The Cold War Era", "The End of Bipolarity", "US Hegemony in World Politics",
      "Alternative Centres of Power", "Contemporary South Asia",
      "International Organisations", "Security in the Contemporary World",
      "Environment and Natural Resources", "Globalisation",
      "Challenges of Nation-Building", "Era of One-Party Dominance",
      "Politics of Planned Development", "India's External Relations",
      "Challenges to and Restoration of the Congress System",
      "Crisis of the Democratic Order", "Rise of Popular Movements",
      "Regional Aspirations", "Rise of New Social Movements",
      "Recent Developments in Indian Politics"
    ]
  }
};

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    grade: "",
    subject: "",
    chapter: "",
    difficulty: "medium",
    count: 5,
    question_type: "mcq",
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const subjects = form.grade ? Object.keys(CURRICULUM[parseInt(form.grade)] || {}) : [];
  const chapters = form.grade && form.subject ? CURRICULUM[parseInt(form.grade)]?.[form.subject] || [] : [];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "grade") {
      setForm({ ...form, grade: value, subject: "", chapter: "" });
    } else if (name === "subject") {
      setForm({ ...form, subject: value, chapter: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleGenerate() {
    setError("");
    setSaved(false);
    setQuestions([]);
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const payload = {
        subject: form.subject,
        topic: form.chapter,
        difficulty: form.difficulty,
        count: parseInt(form.count),
        question_type: form.question_type,
      };
      const res = await axios.post(`${BACKEND}/api/questions/generate`, payload, { headers });
      setQuestions(res.data.questions);
    } catch (err) {
      setError("Failed to generate questions. Check your Gemini API key.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const headers = await getAuthHeader();
      await axios.post(
        `${BACKEND}/api/questions/save`,
        {
          questions: questions.map(q => ({
            ...q,
            subject: form.subject,
            topic: form.chapter,
            difficulty: form.difficulty,
            grade: form.grade,
          }))
        },
        { headers }
      );
      setSaved(true);
    } catch (err) {
      setError("Failed to save questions.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditQuestion(index, value) {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  }

  function handleEditAnswer(index, value) {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  }

  function handleRemove(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  const canGenerate = form.grade && form.subject && form.chapter;

  return (
    <div className="min-h-screen bg-surface">

      {/* Top nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="Eval" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-on-surface">Eval</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-on-surface-variant hover:text-on-surface transition"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            AI Question Generator
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Generate CBSE questions instantly using Gemini AI
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Grade */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Class</label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="">Select class</option>
                {[6,7,8,9,10,11,12].map(g => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                disabled={!form.grade}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
              >
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Chapter</label>
              <select
                name="chapter"
                value={form.chapter}
                onChange={handleChange}
                disabled={!form.subject}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
              >
                <option value="">Select chapter</option>
                {chapters.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Difficulty</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Question Type</label>
              <select
                name="question_type"
                value={form.question_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="true_false">True / False</option>
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Number of Questions</label>
              <input
                name="count"
                type="number"
                min={1}
                max={20}
                value={form.count}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

          </div>

          {error && (
            <div className="mt-4 bg-error-container text-error text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="mt-6 inline-flex items-center gap-2 bg-secondary text-on-secondary font-semibold py-2.5 px-6 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating...
              </>
            ) : "✦ Generate with AI"}
          </button>
        </div>

        {/* Generated questions */}
        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-on-surface">
                Generated Questions ({questions.length})
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="bg-primary text-on-primary font-semibold py-2 px-5 rounded-lg text-sm hover:bg-primary-container transition disabled:opacity-50"
              >
                {saved ? "✓ Saved to Bank" : saving ? "Saving..." : "Save to Question Bank"}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Q{i + 1}</span>
                    <button onClick={() => handleRemove(i)}
                      className="text-xs text-outline hover:text-error transition">
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={q.question}
                    onChange={(e) => handleEditQuestion(i, e.target.value)}
                    rows={2}
                    className="w-full text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options?.map((opt, j) => (
                      <div key={j} className={`text-sm px-3 py-2 rounded-lg border ${
                        opt === q.answer
                          ? "border-tertiary-container bg-tertiary-container text-on-tertiary-container font-semibold"
                          : "border-outline-variant text-on-surface-variant"
                      }`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">Answer:</span>
                    <select
                      value={q.answer}
                      onChange={(e) => handleEditAnswer(i, e.target.value)}
                      className="text-xs border border-outline-variant rounded px-2 py-1 bg-surface-container-low text-on-surface focus:outline-none"
                    >
                      {q.options?.map((opt, j) => (
                        <option key={j} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-on-surface-variant mt-3 bg-surface-container px-3 py-2 rounded-lg">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}