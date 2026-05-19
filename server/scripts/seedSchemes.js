const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
const Scheme = require("../models/Scheme");

const seedSchemes = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "A central sector scheme to provide income support to all landholding farmers' families in the country to supplement their financial needs.",
    category: "Agriculture",
    benefit: "₹6,000 per year",
    deadline: "Ongoing",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    state: "Central",
    icon: "🌾",
    eligibilityCriteria: {
      occupation: ["farmer"],
    },
    documents: ["Aadhaar Card", "Bank Passbook", "Land Ownership Documents"],
    applicationProcess: "1. Visit the official PM-KISAN portal.\n2. Click on 'New Farmer Registration' under the Farmers Corner.\n3. Enter your Aadhaar number and fill out the form.\n4. Submit the required documents.",
    exclusions: ["Institutional landholders", "Current or former holding constitutional posts", "Professionals like doctors, engineers paying income tax"],
    faqs: ["Who is eligible??All landholding farmers' families.", "What is the benefit??₹6,000 per year in 3 equal installments."],
    sourceUrl: "https://pmkisan.gov.in/"
  },
  {
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PMJAY)",
    description: "A national public health insurance fund of the Government of India that aims to provide free access to health insurance coverage for low income earners in the country.",
    category: "Health",
    benefit: "₹5,00,000 health cover per family per year",
    deadline: "Ongoing",
    ministry: "Ministry of Health and Family Welfare",
    state: "Central",
    icon: "⚕️",
    eligibilityCriteria: {
      maxIncome: 250000,
    },
    documents: ["Aadhaar Card", "Ration Card", "Mobile Number"],
    applicationProcess: "1. Visit an empaneled hospital or Common Service Centre (CSC).\n2. Provide your Ration Card or Aadhaar Card for verification.\n3. Get your Ayushman Card generated instantly.",
    exclusions: ["Families with motorized 2/3/4 wheelers", "Government employees", "Income tax payers"],
    faqs: ["Is it cashless??Yes, it provides cashless treatment at empaneled hospitals.", "How to check eligibility??You can check using your mobile number on the Mera PMJAY portal."],
    sourceUrl: "https://pmjay.gov.in/"
  },
  {
    name: "Pradhan Mantri Awas Yojana (PMAY-U)",
    description: "A flagship mission providing housing for all in urban areas. It provides central assistance to implementing agencies through States/Union Territories for providing houses to all eligible families/beneficiaries.",
    category: "Housing",
    benefit: "Credit linked subsidy up to ₹2.67 lakhs",
    deadline: "December 2024",
    ministry: "Ministry of Housing and Urban Affairs",
    state: "Central",
    icon: "🏠",
    eligibilityCriteria: {
      maxIncome: 1800000,
    },
    documents: ["Aadhaar Card", "Income Proof", "Bank Account Details", "Property Documents"],
    applicationProcess: "1. Apply online on the PMAY official portal or through Common Service Centres (CSC).\n2. Fill the application under 'Slum Dwellers' or 'Benefits under other 3 components'.\n3. Track your assessment status.",
    exclusions: ["Families already owning a pucca house anywhere in India"],
    faqs: ["Who can apply??EWS, LIG, and MIG income groups.", "Is it applicable for rural areas??No, PMAY-G is for rural areas."],
    sourceUrl: "https://pmaymis.gov.in/"
  },
  {
    name: "Sukanya Samriddhi Yojana (SSY)",
    description: "A small deposit scheme for the girl child launched as a part of the 'Beti Bachao Beti Padhao' campaign. It comes with a high interest rate and tax benefits.",
    category: "Women",
    benefit: "High interest savings for girl child education/marriage",
    deadline: "Ongoing",
    ministry: "Ministry of Finance",
    state: "Central",
    icon: "👧",
    eligibilityCriteria: {
      gender: "female",
      maxAge: 10,
    },
    documents: ["Birth Certificate of Girl Child", "Identity proof of parent", "Address proof of parent"],
    applicationProcess: "1. Visit any post office or authorized commercial bank.\n2. Fill the account opening form (Form-1).\n3. Submit with KYC documents and initial deposit.",
    exclusions: ["Boys", "Girls older than 10 years at account opening"],
    faqs: ["What is the minimum deposit??₹250 per financial year.", "When does the account mature??21 years from the date of account opening."],
    sourceUrl: "https://www.nsiindia.gov.in/"
  },
  {
    name: "PM SVANidhi",
    description: "A special micro-credit facility for street vendors to resume their livelihoods that were adversely affected by the COVID-19 pandemic.",
    category: "Business",
    benefit: "Working capital loan up to ₹50,000",
    deadline: "December 2024",
    ministry: "Ministry of Housing and Urban Affairs",
    state: "Central",
    icon: "🤝",
    eligibilityCriteria: {
      occupation: ["self-employed", "unemployed"],
    },
    documents: ["Aadhaar Card", "Voter ID", "Bank Passbook", "Certificate of Vending"],
    applicationProcess: "1. Apply online through the PM SVANidhi portal or visit a nearby CSC.\n2. Upload the required KYC documents.\n3. Choose your preferred lending institution.",
    exclusions: ["Individuals who are not street vendors"],
    faqs: ["What is the interest subsidy??7% per annum on regular repayment.", "Do I need collateral??No, these are collateral-free loans."],
    sourceUrl: "https://pmsvanidhi.mohua.gov.in/"
  },
  {
    name: "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
    description: "A voluntary and contributory pension scheme for the unorganized sector workers to ensure old age protection.",
    category: "Welfare",
    benefit: "₹3,000 monthly pension after age 60",
    deadline: "Ongoing",
    ministry: "Ministry of Labour and Employment",
    state: "Central",
    icon: "👴",
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
      maxIncome: 180000,
    },
    documents: ["Aadhaar Card", "Savings Bank Account / Jan Dhan Account with IFSC"],
    applicationProcess: "1. Visit the nearest Common Service Centre (CSC).\n2. Provide Aadhaar card and Bank details for auto-debit.\n3. Initial cash contribution is made at the CSC.",
    exclusions: ["Organized sector workers (EPFO/NPS/ESIC members)", "Income taxpayers"],
    faqs: ["Who pays the premium??Matching contribution is paid by the Government of India.", "What happens on death of beneficiary??Spouse gets 50% of the pension."],
    sourceUrl: "https://maandhan.in/"
  },
  {
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    description: "National Mission for Financial Inclusion to ensure access to financial services, namely, basic savings & deposit accounts, remittance, credit, insurance, pension in an affordable manner.",
    category: "Business",
    benefit: "Zero balance account with ₹2 lakh accidental cover",
    deadline: "Ongoing",
    ministry: "Ministry of Finance",
    state: "Central",
    icon: "🏦",
    eligibilityCriteria: {
      minAge: 10,
    },
    documents: ["Aadhaar Card", "Any valid KYC document (Voter ID, Passport, etc.)"],
    applicationProcess: "1. Visit any bank branch or Bank Mitra.\n2. Ask for the PMJDY account opening form.\n3. Submit with your Aadhaar card.",
    exclusions: [],
    faqs: ["Is there a minimum balance requirement??No, it is a zero balance account.", "Do I get a debit card??Yes, a RuPay debit card is provided free of cost."],
    sourceUrl: "https://pmjdy.gov.in/"
  },
  {
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    description: "A scheme launched to provide loans up to 10 lakh to the non-corporate, non-farm small/micro enterprises.",
    category: "Business",
    benefit: "Loans up to ₹10 Lakh without collateral",
    deadline: "Ongoing",
    ministry: "Ministry of Finance",
    state: "Central",
    icon: "💼",
    eligibilityCriteria: {
      minAge: 18,
      occupation: ["self-employed", "employed", "unemployed"],
    },
    documents: ["Identity Proof", "Address Proof", "Business Plan", "Recent Photographs"],
    applicationProcess: "1. Approach any commercial bank, RRB, Small Finance Bank, or MFI.\n2. Fill the MUDRA loan application form.\n3. Present your business plan and requirements.",
    exclusions: ["Corporate entities", "Farm-based agricultural activities"],
    faqs: ["Are there different loan categories??Yes: Shishu (upto 50K), Kishore (50K-5L), Tarun (5L-10L).", "Is collateral required??No collateral is needed."],
    sourceUrl: "https://www.mudra.org.in/"
  },
  {
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    description: "Safeguards the health of women and children by providing them with a clean cooking fuel – LPG, so that they don't have to compromise their health in smoky kitchens.",
    category: "Welfare",
    benefit: "Free LPG connection to BPL families",
    deadline: "Ongoing",
    ministry: "Ministry of Petroleum and Natural Gas",
    state: "Central",
    icon: "🔥",
    eligibilityCriteria: {
      gender: "female",
      minAge: 18,
      maxIncome: 100000,
    },
    documents: ["BPL Certificate", "Aadhaar Card", "Bank Account Details", "Passport Size Photo"],
    applicationProcess: "1. Collect the application form from any LPG distributor or online.\n2. Fill in the details and attach required documents.\n3. Submit at the nearest LPG distributorship.",
    exclusions: ["Households already having an LPG connection"],
    faqs: ["Who gets the connection??The connection is issued in the name of adult women of the BPL family.", "Is the first refill free??Yes, the first refill and hotplate are free under Ujjwala 2.0."],
    sourceUrl: "https://www.pmuy.gov.in/"
  },
  {
    name: "Stand-Up India Scheme",
    description: "Facilitates bank loans between 10 lakh and 1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.",
    category: "Business",
    benefit: "Loans from ₹10 Lakh to ₹1 Crore",
    deadline: "Ongoing",
    ministry: "Ministry of Finance",
    state: "Central",
    icon: "🏢",
    eligibilityCriteria: {
      minAge: 18,
      casteCategory: ["SC", "ST"],
    },
    documents: ["Caste Certificate", "Identity Proof", "Business Project Report", "Bank Account Details"],
    applicationProcess: "1. Apply via the Stand-Up India portal, directly at a bank branch, or through a Lead District Manager.\n2. Submit your greenfield project details.",
    exclusions: ["Non-greenfield (existing) enterprises", "Defaulters to any bank/financial institution"],
    faqs: ["Who is eligible??SC/ST and/or women entrepreneurs above 18 years.", "What is a greenfield enterprise??First time venture in manufacturing, services or trading sector."],
    sourceUrl: "https://www.standupmitra.in/"
  },
  {
    name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    description: "Enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment in a financial year to every household whose adult members volunteer to do unskilled manual work.",
    category: "Welfare",
    benefit: "100 days of guaranteed wage employment",
    deadline: "Ongoing",
    ministry: "Ministry of Rural Development",
    state: "Central",
    icon: "⛏️",
    eligibilityCriteria: {
      minAge: 18,
    },
    documents: ["Aadhaar Card", "Bank Account Details", "Photograph"],
    applicationProcess: "1. Register at your Gram Panchayat.\n2. Provide name, age, and address of adult members.\n3. Collect your Job Card within 15 days.",
    exclusions: ["Urban residents"],
    faqs: ["What is the wage rate??It varies by state, generally between ₹200-₹350 per day.", "Is unemployment allowance provided??Yes, if work is not provided within 15 days of demanding."],
    sourceUrl: "https://nrega.nic.in/"
  },
  {
    name: "Atal Pension Yojana (APY)",
    description: "A pension scheme for citizens of India focused on the unorganized sector workers, providing a guaranteed minimum pension.",
    category: "Welfare",
    benefit: "Guaranteed pension of ₹1000 to ₹5000",
    deadline: "Ongoing",
    ministry: "Ministry of Finance",
    state: "Central",
    icon: "💰",
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 40,
    },
    documents: ["Savings Bank Account", "Aadhaar Card"],
    applicationProcess: "1. Visit your bank branch where you have a savings account.\n2. Fill up the APY registration form.\n3. Ensure sufficient balance for monthly auto-debit.",
    exclusions: ["Income taxpayers (as of 2022 amendment)"],
    faqs: ["When does the pension start??At the age of 60 years.", "Can I increase my contribution??Yes, you can upgrade your pension slab later."],
    sourceUrl: "https://npscra.nsdl.co.in/scheme-details.php"
  },
  {
    name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    description: "A state specific scheme to provide quality healthcare to the eligible persons through empaneled government and private hospitals and to reduce the financial hardship.",
    category: "Health",
    benefit: "Up to ₹5 Lakh per family per year",
    deadline: "Ongoing",
    ministry: "State Health Department",
    state: "Tamil Nadu",
    icon: "🏥",
    eligibilityCriteria: {
      maxIncome: 120000,
      states: ["Tamil Nadu"]
    },
    documents: ["Ration Card", "Income Certificate", "VAO Certificate", "Aadhaar Card"],
    applicationProcess: "1. Obtain Income certificate from Village Administrative Officer.\n2. Visit the District Kiosk.\n3. Take biometric photo and get the Smart Card.",
    exclusions: ["Families with income above ₹1,20,000 per annum"],
    faqs: ["Is it valid in private hospitals??Yes, in all empaneled private and government hospitals."],
    sourceUrl: "https://www.cmchistn.com/"
  },
  {
    name: "Mukhyamantri Chiranjeevi Swasthya Bima Yojana",
    description: "A Rajasthan state scheme providing cashless health insurance cover to every family of the state.",
    category: "Health",
    benefit: "Cashless health insurance up to ₹25 Lakhs",
    deadline: "Ongoing",
    ministry: "Department of Medical, Health and Family Welfare",
    state: "Rajasthan",
    icon: "👨‍⚕️",
    eligibilityCriteria: {
      states: ["Rajasthan"]
    },
    documents: ["Jan Aadhaar Card", "Aadhaar Card"],
    applicationProcess: "1. Register online on the Chiranjeevi portal or via e-Mitra.\n2. Use Jan Aadhaar number for authentication.\n3. Pay premium if not in the free category.",
    exclusions: [],
    faqs: ["Who gets it for free??NFSA, SECC families, marginal farmers, and contract workers.", "What is the premium for others??₹850 per year."],
    sourceUrl: "https://chiranjeevi.rajasthan.gov.in/"
  },
  {
    name: "Post Matric Scholarship for SC/ST Students",
    description: "Provides financial assistance to the Scheduled Caste and Scheduled Tribe students studying at post matriculation or post-secondary stage to enable them to complete their education.",
    category: "Education",
    benefit: "Maintenance allowance, reimbursement of fees",
    deadline: "October 2024",
    ministry: "Ministry of Social Justice and Empowerment",
    state: "Central",
    icon: "🎓",
    eligibilityCriteria: {
      casteCategory: ["SC", "ST"],
      maxIncome: 250000,
    },
    documents: ["Caste Certificate", "Income Certificate", "Marksheet of last exam", "Bank Details"],
    applicationProcess: "1. Register on the National Scholarship Portal (NSP).\n2. Fill the application form and upload documents.\n3. Submit for institute verification.",
    exclusions: ["Students pursuing part-time courses", "Students whose family income exceeds ₹2.5 Lakhs"],
    faqs: ["How is the scholarship paid??Directly into the student's bank account via DBT."],
    sourceUrl: "https://scholarships.gov.in/"
  }
];

// Generate 2000 more variations programmatically
const categories = ["Agriculture", "Education", "Health", "Housing", "Business", "Welfare", "Women", "Other", "Infrastructure", "Technology", "Renewable Energy"];
const statesList = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const targetDemographics = ["Youth", "Farmers", "Women", "Senior Citizens", "Students", "Entrepreneurs", "Artisans", "Tribal Communities", "Rural Areas", "Urban Poor"];

for (let i = 1; i <= 2000; i++) {
  const isState = Math.random() > 0.5;
  const state = isState ? statesList[Math.floor(Math.random() * statesList.length)] : "Central";
  const demographic = targetDemographics[Math.floor(Math.random() * targetDemographics.length)];
  
  let casteCategory = [];
  if (demographic === "Tribal Communities") casteCategory = ["ST"];
  else if (Math.random() > 0.9) casteCategory = [["SC"], ["OBC"], ["SC", "ST"]][Math.floor(Math.random() * 3)];

  let gender = "any";
  if (demographic === "Women") gender = "female";
  else if (Math.random() > 0.9) gender = "female";

  let occupation = [];
  if (demographic === "Farmers") occupation = ["farmer"];
  else if (demographic === "Students") occupation = ["student"];
  else if (demographic === "Entrepreneurs") occupation = ["business", "self-employed"];
  else if (Math.random() > 0.8) occupation = [["farmer"], ["student"], ["salaried", "self-employed"]][Math.floor(Math.random() * 3)];

  let minAge = Math.random() > 0.4 ? 18 : null;
  let maxAge = null;
  if (demographic === "Senior Citizens") minAge = 60;
  if (demographic === "Youth") { minAge = 18; maxAge = 35; }

  let maxIncome = Math.random() > 0.7 ? 500000 : null;
  if (demographic === "Urban Poor" || demographic === "Rural Areas") maxIncome = 250000;

  seedSchemes.push({
    name: `${state} ${demographic} Support Initiative ${i}`,
    description: `A comprehensive development scheme aimed at improving the livelihood, education, and socio-economic status of ${demographic.toLowerCase()} across the region.`,
    category: categories[Math.floor(Math.random() * categories.length)],
    benefit: `Financial assistance of ₹${(Math.floor(Math.random() * 100) + 5) * 1000}`,
    deadline: Math.random() > 0.5 ? "Ongoing" : `December 202${Math.floor(Math.random() * 4) + 4}`,
    ministry: isState ? `State Department of ${demographic.split(" ")[0]} Welfare` : `Ministry of ${demographic.split(" ")[0]} Affairs`,
    state: state,
    icon: ["🌟", "📈", "🛡️", "🌱", "💡", "🏫", "🏭", "🤝", "🚀", "👨‍🌾", "👩‍🎓"][Math.floor(Math.random() * 11)],
    eligibilityCriteria: {
      minAge,
      maxAge,
      maxIncome,
      gender,
      states: isState ? [state] : [],
      occupation,
      casteCategory
    },
    documents: ["Aadhaar Card", "Bank Account Details", "Resident Proof"],
    applicationProcess: "1. Visit your local administrative office or official portal.\n2. Submit the duly filled application form with required documents.\n3. Track your status online via the reference ID.",
    exclusions: ["Government Employees", "Income Tax Payers"],
    faqs: ["Who is eligible??Citizens meeting the baseline criteria from the designated demographic.", "How long does approval take??Typically 30-45 working days."],
    sourceUrl: "https://india.gov.in/"
  });
}

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    await Scheme.deleteMany({});
    console.log("Cleared existing schemes.");

    await Scheme.insertMany(seedSchemes);
    console.log(`Successfully seeded ${seedSchemes.length} schemes!`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

runSeeder();
