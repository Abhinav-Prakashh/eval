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
  1: {
    Mathematics: [
      "Shapes and Space",
      "Numbers from One to Nine",
      "Addition",
      "Subtraction",
      "Numbers from Ten to Twenty",
      "Time",
      "Measurement",
      "Numbers from Twenty-one to Fifty",
      "Data Handling",
      "Patterns",
      "Numbers",
      "Money",
    ],
    English: [
      "A Happy Child",
      "Three Little Pigs",
      "After a Bath",
      "The Bubble, the Straw and the Shoe",
      "One Little Kitten",
      "Lalu and Peelu",
      "Once I Saw a Little Bird",
      "Mittu and the Yellow Mango",
      "Moo",
      "Rain",
      "Haldi's Adventure",
      "Chottu's House",
      "The Puppet Show",
    ],
    Hindi: [
      "झूला",
      "आम की कहानी",
      "आम की टोकरी",
      "पत्ते ही पत्ते",
      "पकौड़ी",
      "छुक-छुक गाड़ी",
      "रसोईघर",
      "चूहो! म्याऊँ सो गई है",
      "बंदर और गिलहरी",
      "पगड़ी",
      "पतंग",
      "गेंद-बल्ला",
      "बंदर गया खेत में भाग",
    ],
  },
  2: {
    Mathematics: [
      "What is Long, What is Round?",
      "Counting in Groups",
      "How Much Can You Carry?",
      "Counting in Tens",
      "Patterns",
      "Footprints",
      "Jugs and Mugs",
      "Tens and Ones",
      "My Funday",
      "Add our Points",
      "Lines and Lines",
      "Give and Take",
      "The Longest Step",
      "Birds Come, Birds Go",
      "How Many Ponytails?",
    ],
    English: [
      "First Day at School",
      "Haldi's Adventure",
      "I am Lucky!",
      "I Want",
      "A Smile",
      "The Wind and the Sun",
      "Rain",
      "Storm in the Garden",
      "Funny Bunny",
      "Cloud",
      "Mr. Nobody",
      "Curlylocks and the Three Bears",
      "On My Blackboard I Can Draw",
      "Make it Shorter",
    ],
    Hindi: [
      "ऊँट चला",
      "भालू ने खेली फुटबॉल",
      "म्याऊँ, म्याऊँ!!",
      "अधूरी कहानी",
      "दोस्त की मदद",
      "बहुत हुआ",
      "मीठी सारंगी",
      "तितली और कली",
      "बुलबुल",
      "मेरी किताब",
      "चाँद वाली अम्मा",
      "सूरज जल्दी आना जी",
      "नानी के घर जाएँगे",
      "टेसू राजा बीच बाज़ार",
    ],
  },
  3: {
    Mathematics: [
      "Where to Look From",
      "Fun with Numbers",
      "Give and Take",
      "Long and Short",
      "Shapes and Designs",
      "Fun with Give and Take",
      "Time Goes On",
      "Who is Heavier?",
      "How Many Times?",
      "Play with Patterns",
      "Jugs and Mugs",
      "Can We Share?",
      "Smart Charts!",
      "Rupees and Paise",
    ],
    Science: [
      "Plants Around Us",
      "The Plant Fairy",
      "Water O Water",
      "Our Friends Animals",
      "Seeds, Seeds, Seeds",
      "A Tree House",
      "Changing Families",
      "Flying High",
      "It's Raining",
      "What is Cooking",
      "From Here to There",
      "Work We Do",
      "I Have Learnt",
    ],
    English: [
      "Good Morning",
      "The Magic Garden",
      "Bird Talk",
      "Nina and the Baby Sparrows",
      "Little by Little",
      "The Enormous Turnip",
      "Sea Song",
      "A Little Fish Story",
      "Don't Tell",
      "He is My Brother",
      "Litter",
      "The Quarrel",
      "The Ship of the Desert",
      "A Bottle of Dew",
    ],
    Hindi: [
      "कक्कू",
      "शेखीबाज़ मक्खी",
      "चाँद वाली अम्मा",
      "मन करता है",
      "बहादुर बित्तो",
      "हमसे सब कहते",
      "टिपटिपवा",
      "बंदर बाँट",
      "अक्ल बड़ी या भैंस",
      "क्योंजीमल और कैसे कैसलिया",
      "मीरा बहन और बाघ",
      "जब मुझे साँप ने काटा",
      "मिर्च का मज़ा",
      "सबसे अच्छा पेड़",
    ],
  },
  4: {
    Mathematics: [
      "Building with Bricks",
      "Long and Short",
      "A Trip to Bhopal",
      "Tick-Tick-Tick",
      "The Way the World Looks",
      "The Junk Seller",
      "Jugs and Mugs",
      "Carts and Wheels",
      "Halves and Quarters",
      "Play with Patterns",
      "Tables and Shares",
      "How Heavy? How Light?",
      "Fields and Fences",
      "Smart Charts",
    ],
    Science: [
      "Going to School",
      "Ear to Ear",
      "A Day with Nandu",
      "The Story of Amrita",
      "Anita and the Honeybees",
      "Omana's Journey",
      "From the Window",
      "Reaching Grandmother's House",
      "Changing Families",
      "Hu Tu Tu, Hu Tu Tu",
      "The Valley of Flowers",
      "Changing Times",
      "A River's Tale",
      "Basva's Farm",
      "From Market to Home",
      "A Busy Month",
    ],
    English: [
      "Wake Up!",
      "Neha's Alarm Clock",
      "Noses",
      "The Little Fir Tree",
      "Run!",
      "Nasruddin's Aim",
      "Why",
      "Alice in Wonderland",
      "Don't be Afraid of the Dark",
      "Helen Keller",
      "The Donkey",
      "The Cop and the Anthem",
      "The Torn Pocket",
      "Pinocchio",
    ],
    Hindi: [
      "मन के भोले-भाले बादल",
      "जैसा सवाल वैसा जवाब",
      "किरमिच की गेंद",
      "पापा जब बच्चे थे",
      "दोस्त की पोशाक",
      "नाव बनाओ नाव बनाओ",
      "दान का हिसाब",
      "कौन",
      "स्वतंत्रता की ओर",
      "थप्प रोटी थप्प दाल",
      "पढ़क्कू की सूझ",
      "सुनीता की पहिया कुर्सी",
      "हुदहुद",
      "मुफ़्त ही मुफ़्त",
    ],
  },
  5: {
    Mathematics: [
      "The Fish Tale",
      "Shapes and Angles",
      "How Many Squares?",
      "Parts and Wholes",
      "Does it Look the Same?",
      "Be My Multiple, I'll be Your Factor",
      "Can You See the Pattern?",
      "Mapping Your Way",
      "Boxes and Sketches",
      "Tenths and Hundredths",
      "Area and its Boundary",
      "Smart Charts",
      "Ways to Multiply and Divide",
      "How Big? How Heavy?",
    ],
    Science: [
      "Super Senses",
      "A Snake Charmer's Story",
      "From Tasting to Digesting",
      "Mangoes Round the Year",
      "Seeds and Seeds",
      "Every Drop Counts",
      "Experiments with Water",
      "A Treat for Mosquitoes",
      "Up You Go!",
      "Walls Tell Stories",
      "Sunita in Space",
      "What if it Finishes?",
      "A Shelter so High!",
      "When the Earth Shook!",
      "Blow Hot, Blow Cold",
      "Who Will Do This Work?",
      "Across the Wall",
      "No Place for Us?",
      "A Seed Tells a Farmer's Story",
      "Whose Forests?",
      "Like Father, Like Daughter",
      "On the Move Again",
    ],
    English: [
      "Ice-Cream Man",
      "Wonderful Waste!",
      "Teamwork",
      "Flying Together",
      "My Shadow",
      "Robinson Crusoe",
      "Crying",
      "My Elder Brother",
      "The Lazy Frog",
      "Rip Van Winkle",
      "Class Discussion",
      "The Talkative Barber",
      "Topsy-Turvy Land",
      "Gulliver's Travels",
      "Nobody's Friend",
      "The Little Bully",
      "I am the Tallest",
      "Who Will be Ningthou?",
    ],
    Hindi: [
      "राख की रस्सी",
      "फ़सलों के त्योहार",
      "खिलौनेवाला",
      "नन्हा फ़नकार",
      "जहाँ चाह वहाँ राह",
      "चिट्ठी का सफ़र",
      "डाकिए की कहानी, कँवरसिंह की ज़बानी",
      "वे दिन भी क्या दिन थे",
      "एक माँ की बेबसी",
      "चुनौती हिमालय की",
    ],
  },
  6: {
    Mathematics: [
      "Knowing Our Numbers",
      "Whole Numbers",
      "Playing with Numbers",
      "Basic Geometrical Ideas",
      "Understanding Elementary Shapes",
      "Integers",
      "Fractions",
      "Decimals",
      "Data Handling",
      "Mensuration",
      "Algebra",
      "Ratio and Proportion",
      "Symmetry",
      "Practical Geometry",
    ],
    Science: [
      "Food: Where Does It Come From?",
      "Components of Food",
      "Fibre to Fabric",
      "Sorting Materials into Groups",
      "Separation of Substances",
      "Changes Around Us",
      "Getting to Know Plants",
      "Body Movements",
      "The Living Organisms and Their Surroundings",
      "Motion and Measurement of Distances",
      "Light, Shadows and Reflections",
      "Electricity and Circuits",
      "Fun with Magnets",
      "Water",
      "Air Around Us",
      "Garbage In, Garbage Out",
    ],
    "Social Science": [
      "What, Where, How and When?",
      "On The Trial of the Earliest People",
      "From Gathering to Growing Food",
      "In the Earliest Cities",
      "What Books and Burials Tell Us",
      "Kingdoms, Kings and an Early Republic",
      "New Questions and Ideas",
      "Ashoka, the Emperor Who Gave Up War",
      "Vital Villages, Thriving Towns",
      "Traders, Kings and Pilgrims",
      "New Empires and Kingdoms",
      "Buildings, Paintings and Books",
      "The Earth in the Solar System",
      "Globe: Latitudes and Longitudes",
      "Motions of the Earth",
      "Maps",
      "Major Domains of the Earth",
      "Major Landforms of the Earth",
      "Our Country India",
      "India: Climate, Vegetation and Wildlife",
      "Understanding Diversity",
      "Diversity and Discrimination",
      "What is Government?",
      "Key Elements of a Democratic Government",
      "Panchayati Raj",
      "Rural Administration",
      "Urban Administration",
      "Rural Livelihoods",
      "Urban Livelihoods",
    ],
    English: [
      "Who Did Patrick's Homework?",
      "How the Dog Found Himself a New Master!",
      "Taro's Reward",
      "An Indian American Woman in Space",
      "A Different Kind of School",
      "Who I Am",
      "Fair Play",
      "A Game of Chance",
      "Desert Animals",
      "The Banyan Tree",
    ],
    Hindi: [
      "वह चिड़िया जो",
      "बचपन",
      "नादान दोस्त",
      "चाँद से थोड़ी सी गप्पें",
      "अक्षरों का महत्व",
      "पार नज़र के",
      "साथी हाथ बढ़ाना",
      "ऐसे–ऐसे",
      "टिकट अलबम",
      "झाँसी की रानी",
      "जो देखकर भी नहीं देखते",
      "संसार पुस्तक है",
      "मैं सबसे छोटी होऊं",
      "लोकगीत",
      "नौकर",
      "वन के मार्ग में",
      "साँस–साँस में बाँस",
    ],
  },
  7: {
    Mathematics: [
      "Integers",
      "Fractions and Decimals",
      "Data Handling",
      "Simple Equations",
      "Lines and Angles",
      "The Triangle and its Properties",
      "Congruence of Triangles",
      "Comparing Quantities",
      "Rational Numbers",
      "Practical Geometry",
      "Perimeter and Area",
      "Algebraic Expressions",
      "Exponents and Powers",
      "Symmetry",
      "Visualising Solid Shapes",
    ],
    Science: [
      "Nutrition in Plants",
      "Nutrition in Animals",
      "Fibre to Fabric",
      "Heat",
      "Acids, Bases and Salts",
      "Physical and Chemical Changes",
      "Weather, Climate and Adaptations",
      "Winds, Storms and Cyclones",
      "Soil",
      "Respiration in Organisms",
      "Transportation in Animals and Plants",
      "Reproduction in Plants",
      "Motion and Time",
      "Electric Current and its Effects",
      "Light",
      "Water: A Precious Resource",
      "Forests: Our Lifeline",
      "Wastewater Story",
    ],
    "Social Science": [
      "Tracing Changes Through a Thousand Years",
      "New Kings and Kingdoms",
      "The Delhi Sultans",
      "The Mughal Empire",
      "Rulers and Buildings",
      "Towns, Traders and Craftspersons",
      "Tribes, Nomads and Settled Communities",
      "Devotional Paths to the Divine",
      "The Making of Regional Cultures",
      "Eighteenth-Century Political Formations",
      "Environment",
      "Inside Our Earth",
      "Our Changing Earth",
      "Air",
      "Water",
      "Natural Vegetation and Wildlife",
      "Human Environment – Settlement, Transport and Communication",
      "Human Environment Interactions",
      "Life in the Temperate Grasslands",
      "Life in the Deserts",
      "On Equality",
      "Role of the Government in Health",
      "How the State Government Works",
      "Growing up as Boys and Girls",
      "Women Change the World",
      "Understanding Media",
      "Markets Around Us",
      "A Shirt in the Market",
    ],
    English: [
      "Three Questions",
      "A Gift of Chappals",
      "Gopal and the Hilsa Fish",
      "The Ashes That Made Trees Bloom",
      "Quality",
      "Expert Detectives",
      "The Invention of Vita Wonk",
      "Fire: Friend and Foe",
      "A Bicycle in Good Repair",
      "The Story of Cricket",
    ],
    Hindi: [
      "हम पंछी उन्मुक्त गगन के",
      "दादी माँ",
      "हिमालय की बेटियाँ",
      "कठपुतली",
      "मिठाईवाला",
      "रक्त और हमारा शरीर",
      "पापा खो गए",
      "शाम–एक किसान",
      "चिड़िया की बच्ची",
      "अपूर्व अनुभव",
      "रहीम के दोहे",
      "कंचा",
      "एक तिनका",
      "खानपान की बदलती तस्वीर",
      "नीलकंठ",
      "भोर और बरखा",
      "वीर कुँवर सिंह",
      "संघर्ष के कारण मैं तुनकमिज़ाज हो गया",
      "आश्रम का अनुमानित व्यय",
      "विप्लव-गायन",
    ],
  },
  8: {
    Mathematics: [
      "Rational Numbers",
      "Linear Equations in One Variable",
      "Understanding Quadrilaterals",
      "Practical Geometry",
      "Data Handling",
      "Squares and Square Roots",
      "Cubes and Cube Roots",
      "Comparing Quantities",
      "Algebraic Expressions and Identities",
      "Visualising Solid Shapes",
      "Mensuration",
      "Exponents and Powers",
      "Direct and Inverse Proportions",
      "Factorisation",
      "Introduction to Graphs",
      "Playing with Numbers",
    ],
    Science: [
      "Crop Production and Management",
      "Microorganisms: Friend and Foe",
      "Synthetic Fibres and Plastics",
      "Materials: Metals and Non-Metals",
      "Coal and Petroleum",
      "Combustion and Flame",
      "Conservation of Plants and Animals",
      "Cell Structure and Functions",
      "Reproduction in Animals",
      "Reaching the Age of Adolescence",
      "Force and Pressure",
      "Friction",
      "Sound",
      "Chemical Effects of Electric Current",
      "Some Natural Phenomena",
      "Light",
      "Stars and the Solar System",
      "Pollution of Air and Water",
    ],
    "Social Science": [
      "How, When and Where",
      "From Trade to Territory",
      "Ruling the Countryside",
      "Tribals, Dikus and the Vision of a Golden Age",
      "When People Rebel",
      "Weavers, Iron Smelters and Factory Owners",
      "Civilising the Native, Educating the Nation",
      "Women, Caste and Reform",
      "The Making of the National Movement",
      "India After Independence",
      "Resources",
      "Land, Soil, Water, Natural Vegetation and Wildlife",
      "Mineral and Power Resources",
      "Agriculture",
      "Industries",
      "Human Resources",
      "The Indian Constitution",
      "Understanding Secularism",
      "Why Do We Need a Parliament?",
      "Understanding Laws",
      "Judiciary",
      "Understanding Our Criminal Justice System",
      "Understanding Marginalisation",
      "Confronting Marginalisation",
      "Public Facilities",
      "Law and Social Justice",
    ],
    English: [
      "The Best Christmas Present in the World",
      "The Tsunami",
      "Glimpses of the Past",
      "Bepin Choudhury's Lapse of Memory",
      "The Summit Within",
      "This is Jody's Fawn",
      "A Visit to Cambridge",
      "A Short Monsoon Diary",
      "The Great Stone Face I",
      "The Great Stone Face II",
    ],
    Hindi: [
      "ध्वनि",
      "लाख की चूड़ियाँ",
      "बस की यात्रा",
      "दीवानों की हस्ती",
      "चिट्ठियों की अनूठी दुनिया",
      "भगवान के डाकिए",
      "क्या निराश हुआ जाए",
      "यह सबसे कठिन समय नहीं",
      "कबीर की साखियाँ",
      "कामचोर",
      "जब सिनेमा ने बोलना सीखा",
      "सुदामा चरित",
      "जहाँ पहिया है",
      "अकबरी लोटा",
      "सूरदास के पद",
      "पानी की कहानी",
      "बाज और साँप",
      "टोपी",
    ],
  },
  9: {
    Mathematics: [
      "Number Systems",
      "Polynomials",
      "Coordinate Geometry",
      "Linear Equations in Two Variables",
      "Introduction to Euclid's Geometry",
      "Lines and Angles",
      "Triangles",
      "Quadrilaterals",
      "Areas of Parallelograms and Triangles",
      "Circles",
      "Constructions",
      "Heron's Formula",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
    Science: [
      "Matter in Our Surroundings",
      "Is Matter Around Us Pure?",
      "Atoms and Molecules",
      "Structure of the Atom",
      "The Fundamental Unit of Life",
      "Tissues",
      "Diversity in Living Organisms",
      "Motion",
      "Force and Laws of Motion",
      "Gravitation",
      "Work and Energy",
      "Sound",
      "Why Do We Fall Ill?",
      "Natural Resources",
      "Improvement in Food Resources",
    ],
    Physics: [
      "Motion",
      "Force and Laws of Motion",
      "Gravitation",
      "Work and Energy",
      "Sound",
    ],
    Chemistry: [
      "Matter in Our Surroundings",
      "Is Matter Around Us Pure?",
      "Atoms and Molecules",
      "Structure of the Atom",
    ],
    Biology: [
      "The Fundamental Unit of Life",
      "Tissues",
      "Diversity in Living Organisms",
      "Why Do We Fall Ill?",
      "Natural Resources",
      "Improvement in Food Resources",
    ],
    "Social Science": [
      "The French Revolution",
      "Socialism in Europe and the Russian Revolution",
      "Nazism and the Rise of Hitler",
      "Forest Society and Colonialism",
      "Pastoralists in the Modern World",
      "Peasants and Farmers",
      "History and Sport: The Story of Cricket",
      "Clothes: A Social History",
      "India – Size and Location",
      "Physical Features of India",
      "Drainage",
      "Climate",
      "Natural Vegetation and Wildlife",
      "Population",
      "What is Democracy? Why Democracy?",
      "Constitutional Design",
      "Electoral Politics",
      "Working of Institutions",
      "Democratic Rights",
      "The Story of Village Palampur",
      "People as Resource",
      "Poverty as a Challenge",
      "Food Security in India",
    ],
    English: [
      "The Fun They Had",
      "The Sound of Music",
      "The Little Girl",
      "A Truly Beautiful Mind",
      "The Snake and the Mirror",
      "My Childhood",
      "Packing",
      "Reach for the Top",
      "The Bond of Love",
      "Kathmandu",
      "If I Were You",
    ],
    Hindi: [
      "दो बैलों की कथा",
      "ल्हासा की ओर",
      "उपभोक्तावाद की संस्कृति",
      "साँवले सपनों की याद",
      "नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया",
      "प्रेमचंद के फटे जूते",
      "मेरे बचपन के दिन",
      "एक कुत्ता और एक मैना",
      "इस जल प्रलय में",
      "मेरे संग की औरतें",
      "रीढ़ की हड्डी",
      "माटी वाली",
      "किस तरह आखिरकार मैं हिंदी में आया",
    ],
  },
  10: {
    Mathematics: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Introduction to Trigonometry",
      "Some Applications of Trigonometry",
      "Circles",
      "Constructions",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
    Science: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Periodic Classification of Elements",
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce?",
      "Heredity and Evolution",
      "Light – Reflection and Refraction",
      "Human Eye and Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Sources of Energy",
      "Our Environment",
      "Management of Natural Resources",
    ],
    Physics: [
      "Light – Reflection and Refraction",
      "Human Eye and Colourful World",
      "Electricity",
      "Magnetic Effects of Electric Current",
      "Sources of Energy",
    ],
    Chemistry: [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Periodic Classification of Elements",
    ],
    Biology: [
      "Life Processes",
      "Control and Coordination",
      "How do Organisms Reproduce?",
      "Heredity and Evolution",
      "Our Environment",
      "Management of Natural Resources",
    ],
    "Social Science": [
      "The Rise of Nationalism in Europe",
      "Nationalism in India",
      "The Making of a Global World",
      "The Age of Industrialisation",
      "Print Culture and the Modern World",
      "Resources and Development",
      "Forest and Wildlife Resources",
      "Water Resources",
      "Agriculture",
      "Minerals and Energy Resources",
      "Manufacturing Industries",
      "Lifelines of National Economy",
      "Power Sharing",
      "Federalism",
      "Democracy and Diversity",
      "Gender, Religion and Caste",
      "Popular Struggles and Movements",
      "Political Parties",
      "Outcomes of Democracy",
      "Challenges to Democracy",
      "Development",
      "Sectors of the Indian Economy",
      "Money and Credit",
      "Globalisation and the Indian Economy",
      "Consumer Rights",
    ],
    English: [
      "A Letter to God",
      "Nelson Mandela: Long Walk to Freedom",
      "Two Stories about Flying",
      "From the Diary of Anne Frank",
      "The Hundred Dresses I",
      "The Hundred Dresses II",
      "Glimpses of India",
      "Mijbil the Otter",
      "Madam Rides the Bus",
      "The Sermon at Benares",
      "The Proposal",
    ],
    Hindi: [
      "सूरदास के पद",
      "तुलसीदास के दोहे",
      "देव",
      "जयशंकर प्रसाद",
      "सूर्यकांत त्रिपाठी निराला",
      "नागार्जुन",
      "गिरिजाकुमार माथुर",
      "ऋतुराज",
      "मंगलेश डबराल",
      "नेताजी का चश्मा",
      "बालगोबिन भगत",
      "लखनवी अंदाज़",
      "एक कहानी यह भी",
      "स्त्री शिक्षा के विरोधी कुतर्कों का खंडन",
      "नौबतखाने में इबादत",
      "संस्कृति",
    ],
  },
  11: {
    Physics: [
      "Physical World",
      "Units and Measurements",
      "Motion in a Straight Line",
      "Motion in a Plane",
      "Laws of Motion",
      "Work, Energy and Power",
      "System of Particles and Rotational Motion",
      "Gravitation",
      "Mechanical Properties of Solids",
      "Mechanical Properties of Fluids",
      "Thermal Properties of Matter",
      "Thermodynamics",
      "Kinetic Theory",
      "Oscillations",
      "Waves",
    ],
    Chemistry: [
      "Some Basic Concepts of Chemistry",
      "Structure of Atom",
      "Classification of Elements and Periodicity in Properties",
      "Chemical Bonding and Molecular Structure",
      "States of Matter",
      "Thermodynamics",
      "Equilibrium",
      "Redox Reactions",
      "Hydrogen",
      "The s-Block Elements",
      "The p-Block Elements",
      "Organic Chemistry: Basic Principles",
      "Hydrocarbons",
      "Environmental Chemistry",
    ],
    Biology: [
      "The Living World",
      "Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
      "Cell: The Unit of Life",
      "Biomolecules",
      "Cell Cycle and Cell Division",
      "Transport in Plants",
      "Mineral Nutrition",
      "Photosynthesis in Higher Plants",
      "Respiration in Plants",
      "Plant Growth and Development",
      "Digestion and Absorption",
      "Breathing and Exchange of Gases",
      "Body Fluids and Circulation",
      "Excretory Products and their Elimination",
      "Locomotion and Movement",
      "Neural Control and Coordination",
      "Chemical Coordination and Integration",
    ],
    Mathematics: [
      "Sets",
      "Relations and Functions",
      "Trigonometric Functions",
      "Principle of Mathematical Induction",
      "Complex Numbers and Quadratic Equations",
      "Linear Inequalities",
      "Permutations and Combinations",
      "Binomial Theorem",
      "Sequences and Series",
      "Straight Lines",
      "Conic Sections",
      "Introduction to Three Dimensional Geometry",
      "Limits and Derivatives",
      "Mathematical Reasoning",
      "Statistics",
      "Probability",
    ],
    English: [
      "The Portrait of a Lady",
      "We're Not Afraid to Die",
      "Discovering Tut: the Saga Continues",
      "Landscape of the Soul",
      "The Ailing Planet",
      "The Browning Version",
      "The Adventure",
      "Silk Road",
      "A Photograph",
      "The Laburnum Top",
      "The Voice of the Rain",
      "Childhood",
      "Father to Son",
    ],
    Accountancy: [
      "Introduction to Accounting",
      "Theory Base of Accounting",
      "Recording of Transactions I",
      "Recording of Transactions II",
      "Bank Reconciliation Statement",
      "Trial Balance and Rectification of Errors",
      "Depreciation, Provisions and Reserves",
      "Bill of Exchange",
      "Financial Statements I",
      "Financial Statements II",
      "Accounts from Incomplete Records",
    ],
    "Business Studies": [
      "Nature and Purpose of Business",
      "Forms of Business Organisation",
      "Private, Public and Global Enterprises",
      "Business Services",
      "Emerging Modes of Business",
      "Social Responsibility of Business and Business Ethics",
      "Formation of a Company",
      "Sources of Business Finance",
      "Small Business",
      "Internal Trade",
      "International Business",
    ],
    Economics: [
      "Introduction to Statistics",
      "Collection of Data",
      "Organisation of Data",
      "Presentation of Data",
      "Measures of Central Tendency",
      "Measures of Dispersion",
      "Correlation",
      "Index Numbers",
      "Indian Economy on the Eve of Independence",
      "Economic Development: Liberalisation, Privatisation, Globalisation",
      "Poverty",
      "Human Capital Formation in India",
      "Rural Development",
      "Employment: Growth, Informalisation and Other Issues",
      "Infrastructure",
      "Environment and Sustainable Development",
    ],
    History: [
      "From the Beginning of Time",
      "Early Cities",
      "An Empire Across Three Continents",
      "The Central Islamic Lands",
      "Nomadic Empires",
      "The Three Orders",
      "Changing Cultural Traditions",
      "Confrontation of Cultures",
      "The Industrial Revolution",
      "Displacing Indigenous Peoples",
      "Paths to Modernisation",
    ],
    Geography: [
      "Geography as a Discipline",
      "The Origin and Evolution of the Earth",
      "Interior of the Earth",
      "Distribution of Oceans and Continents",
      "Minerals and Rocks",
      "Geomorphic Processes",
      "Landforms and their Evolution",
      "Composition and Structure of Atmosphere",
      "Solar Radiation, Heat Balance and Temperature",
      "Atmospheric Circulation and Weather Systems",
      "Water in the Atmosphere",
      "World Climate and Climate Change",
      "Water (Oceans)",
      "Movements of Ocean Water",
      "Life on the Earth",
      "Biodiversity and Conservation",
    ],
    "Political Science": [
      "Political Theory: An Introduction",
      "Freedom",
      "Equality",
      "Social Justice",
      "Rights",
      "Citizenship",
      "Nationalism",
      "Secularism",
      "Peace",
      "Development",
      "Constitution: Why and How?",
      "Rights in the Indian Constitution",
      "Election and Representation",
      "Executive",
      "Legislature",
      "Judiciary",
      "Federalism",
      "Local Governments",
    ],
    Hindi: [
      "हम पंछी उन्मुक्त गगन के",
      "मियाँ नसीरुद्दीन",
      "अपू के साथ ढाई साल",
      "विदाई-संभाषण",
      "गलता लोहा",
      "स्पीति में बारिश",
      "रजनी",
      "जामुन का पेड़",
      "भारत माता",
      "आत्मा का ताप",
      "नमक का दारोगा",
      "मियाँ नसीरुद्दीन",
      "अपू के साथ ढाई साल",
    ],
  },
  12: {
    Physics: [
      "Electric Charges and Fields",
      "Electrostatic Potential and Capacitance",
      "Current Electricity",
      "Moving Charges and Magnetism",
      "Magnetism and Matter",
      "Electromagnetic Induction",
      "Alternating Current",
      "Electromagnetic Waves",
      "Ray Optics and Optical Instruments",
      "Wave Optics",
      "Dual Nature of Radiation and Matter",
      "Atoms",
      "Nuclei",
      "Semiconductor Electronics",
      "Communication Systems",
    ],
    Chemistry: [
      "The Solid State",
      "Solutions",
      "Electrochemistry",
      "Chemical Kinetics",
      "Surface Chemistry",
      "General Principles and Processes of Isolation of Elements",
      "The p-Block Elements",
      "The d and f Block Elements",
      "Coordination Compounds",
      "Haloalkanes and Haloarenes",
      "Alcohols, Phenols and Ethers",
      "Aldehydes, Ketones and Carboxylic Acids",
      "Amines",
      "Biomolecules",
      "Polymers",
      "Chemistry in Everyday Life",
    ],
    Biology: [
      "Reproduction in Organisms",
      "Sexual Reproduction in Flowering Plants",
      "Human Reproduction",
      "Reproductive Health",
      "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance",
      "Evolution",
      "Human Health and Disease",
      "Strategies for Enhancement in Food Production",
      "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes",
      "Biotechnology and its Applications",
      "Organisms and Populations",
      "Ecosystem",
      "Biodiversity and Conservation",
      "Environmental Issues",
    ],
    Mathematics: [
      "Relations and Functions",
      "Inverse Trigonometric Functions",
      "Matrices",
      "Determinants",
      "Continuity and Differentiability",
      "Application of Derivatives",
      "Integrals",
      "Application of Integrals",
      "Differential Equations",
      "Vector Algebra",
      "Three Dimensional Geometry",
      "Linear Programming",
      "Probability",
    ],
    English: [
      "The Last Lesson",
      "Lost Spring",
      "Deep Water",
      "The Rattrap",
      "Indigo",
      "Poets and Pancakes",
      "The Interview",
      "Going Places",
      "My Mother at Sixty-Six",
      "An Elementary School Classroom in a Slum",
      "Keeping Quiet",
      "A Thing of Beauty",
      "A Roadside Stand",
      "Aunt Jennifer's Tigers",
      "Third Level",
      "The Tiger King",
      "The Enemy",
      "On the Face of It",
      "Memories of Childhood",
    ],
    Accountancy: [
      "Accounting for Partnership: Basic Concepts",
      "Change in Profit Sharing Ratio Among the Existing Partners",
      "Admission of a Partner",
      "Retirement and Death of a Partner",
      "Dissolution of Partnership Firm",
      "Accounting for Share Capital",
      "Issue and Redemption of Debentures",
      "Financial Statements of a Company",
      "Analysis of Financial Statements",
      "Accounting Ratios",
      "Cash Flow Statement",
    ],
    "Business Studies": [
      "Nature and Significance of Management",
      "Principles of Management",
      "Business Environment",
      "Planning",
      "Organising",
      "Staffing",
      "Directing",
      "Controlling",
      "Financial Management",
      "Financial Markets",
      "Marketing Management",
      "Consumer Protection",
      "Entrepreneurship Development",
    ],
    Economics: [
      "Introduction to Macroeconomics",
      "National Income Accounting",
      "Money and Banking",
      "Determination of Income and Employment",
      "Government Budget and the Economy",
      "Open Economy Macroeconomics",
      "Introduction to Microeconomics",
      "Theory of Consumer Behaviour",
      "Production and Costs",
      "The Theory of the Firm Under Perfect Competition",
      "Market Equilibrium",
      "Non-competitive Markets",
    ],
    History: [
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
      "Framing the Constitution: The Beginning of a New Era",
    ],
    Geography: [
      "Human Geography: Nature and Scope",
      "The World Population: Distribution, Density and Growth",
      "Population Composition",
      "Human Development",
      "Primary Activities",
      "Secondary Activities",
      "Tertiary and Quaternary Activities",
      "Transport and Communication",
      "International Trade",
      "Human Settlements",
      "Population: Distribution, Density, Growth and Composition",
      "Migration: Types, Causes and Consequences",
      "Land Resources and Agriculture",
      "Water Resources",
      "Mineral and Energy Resources",
      "Manufacturing Industries",
      "Planning and Sustainable Development",
    ],
    "Political Science": [
      "The Cold War Era",
      "The End of Bipolarity",
      "US Hegemony in World Politics",
      "Alternative Centres of Power",
      "Contemporary South Asia",
      "International Organisations",
      "Security in the Contemporary World",
      "Environment and Natural Resources",
      "Globalisation",
      "Challenges of Nation-Building",
      "Era of One-Party Dominance",
      "Politics of Planned Development",
      "India's External Relations",
      "Challenges to and Restoration of the Congress System",
      "Crisis of the Democratic Order",
      "Rise of Popular Movements",
      "Regional Aspirations",
      "Recent Developments in Indian Politics",
    ],
    Hindi: [
      "आत्मपरिचय",
      "दिन जल्दी-जल्दी ढलता है",
      "पतंग",
      "कविता के बहाने",
      "बात सीधी थी पर",
      "कैमरे में बंद अपाहिज",
      "सहर्ष स्वीकारा है",
      "फ़सल",
      "छोटा मेरा खेत",
      "बगुलों के पंख",
      "भक्तिन",
      "बाज़ार दर्शन",
      "काले मेघा पानी दे",
      "पहलवान की ढोलक",
      "चार्ली चैप्लिन यानी हम सब",
      "नमक",
      "शिरीष के फूल",
      "श्रम-विभाजन और जाति-प्रथा",
    ],
  },
};

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    grade: "",
    subject: "",
    difficulty: "medium",
    count: 5,
    question_type: "mcq",
  });
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const subjects = form.grade
    ? Object.keys(CURRICULUM[parseInt(form.grade)] || {})
    : [];
  const chapters =
    form.grade && form.subject
      ? CURRICULUM[parseInt(form.grade)]?.[form.subject] || []
      : [];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "grade") {
      setForm({ ...form, grade: value, subject: "" });
      setSelectedChapters([]);
    } else if (name === "subject") {
      setForm({ ...form, subject: value });
      setSelectedChapters([]);
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function toggleChapter(chapter) {
    setSelectedChapters((prev) =>
      prev.includes(chapter)
        ? prev.filter((c) => c !== chapter)
        : [...prev, chapter],
    );
  }

  function selectAllChapters() {
    setSelectedChapters(chapters);
  }

  function clearChapters() {
    setSelectedChapters([]);
  }

  async function handleGenerate() {
    setError("");
    setSaved(false);
    setQuestions([]);
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const topic =
        selectedChapters.length > 0
          ? selectedChapters.join(", ")
          : "all chapters";
      const payload = {
        subject: form.subject,
        topic,
        difficulty: form.difficulty,
        count: parseInt(form.count),
        question_type: form.question_type,
      };
      const res = await axios.post(
        `${BACKEND}/api/questions/generate`,
        payload,
        { headers },
      );
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
          questions: questions.map((q) => ({
            ...q,
            subject: form.subject,
            topic: selectedChapters.join(", "),
            difficulty: form.difficulty,
            grade: form.grade,
          })),
        },
        { headers },
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

  const canGenerate = form.grade && form.subject;

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/logo.png"
            alt="Eval"
            className="w-8 h-8 object-contain"
          />
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

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Class
              </label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="">Select class</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Class {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Subject
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                disabled={!form.grade}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition disabled:opacity-50"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Difficulty
              </label>
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

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Question Type
              </label>
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

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">
                Number of Questions
              </label>
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

          {/* Chapter multi-select */}
          {chapters.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-on-surface">
                  Chapters
                  <span className="ml-2 text-xs font-normal text-on-surface-variant">
                    (
                    {selectedChapters.length === 0
                      ? "all chapters"
                      : `${selectedChapters.length} selected`}
                    )
                  </span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={selectAllChapters}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    onClick={clearChapters}
                    className="text-xs text-outline font-semibold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg p-3 bg-surface-container-low">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {chapters.map((chapter) => (
                    <label
                      key={chapter}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-sm ${
                        selectedChapters.includes(chapter)
                          ? "bg-primary text-on-primary"
                          : "hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter)}
                        onChange={() => toggleChapter(chapter)}
                        className="hidden"
                      />
                      <span
                        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                          selectedChapters.includes(chapter)
                            ? "border-on-primary bg-on-primary/20"
                            : "border-outline"
                        }`}
                      >
                        {selectedChapters.includes(chapter) && (
                          <svg
                            className="w-2.5 h-2.5"
                            fill="currentColor"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M10 3L5 8.5 2 5.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="truncate">{chapter}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              "✦ Generate with AI"
            )}
          </button>
        </div>

        {questions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-on-surface flex-1">
                Generated Questions ({questions.length})
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="bg-primary text-on-primary font-semibold py-2 px-5 rounded-lg text-sm hover:bg-primary-container transition disabled:opacity-50"
              >
                {saved
                  ? "✓ Saved to Bank"
                  : saving
                    ? "Saving..."
                    : "Save to Question Bank"}
              </button>
              <button
                onClick={() => navigate("/question-bank")}
                className="bg-secondary text-on-secondary font-semibold py-2 px-5 rounded-lg text-sm hover:opacity-90 transition"
              >
                Build Paper →
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 border-l-4 border-l-primary"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Q{i + 1}
                    </span>
                    <button
                      onClick={() => handleRemove(i)}
                      className="text-xs text-outline hover:text-error transition"
                    >
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
                      <div
                        key={j}
                        className={`text-sm px-3 py-2 rounded-lg border ${
                          opt === q.answer
                            ? "border-tertiary-container bg-tertiary-container text-on-tertiary-container font-semibold"
                            : "border-outline-variant text-on-surface-variant"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">
                      Answer:
                    </span>
                    <select
                      value={q.answer}
                      onChange={(e) => handleEditAnswer(i, e.target.value)}
                      className="text-xs border border-outline-variant rounded px-2 py-1 bg-surface-container-low text-on-surface focus:outline-none"
                    >
                      {q.options?.map((opt, j) => (
                        <option key={j} value={opt}>
                          {opt}
                        </option>
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
