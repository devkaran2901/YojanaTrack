import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Scheme } from '../models/Scheme';
import { env } from '../config/env';

const seed = async () => {
  try {
    console.log('🌱 Seeding MongoDB database...\n');

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Scheme.deleteMany({});
    console.log('✅ Database cleared\n');

    // Create test users
    console.log('👤 Creating test users...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'USER',
      state: 'Maharashtra',
      age: 35,
      income: 500000,
      occupation: 'Employee',
      gender: 'MALE',
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      state: 'Delhi',
      age: 40,
      income: 800000,
      occupation: 'Administrator',
      gender: 'MALE',
    });

    console.log(`✅ Users created:
   📧 ${testUser.email} | Password: password123
   📧 ${adminUser.email} | Password: admin123\n`);

    // Create sample schemes
    console.log('🏛️  Creating sample schemes...');

    const schemes = [
      {
        title: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
        slug: 'pradhan-mantri-jan-dhan-yojana',
        description: 'National Mission for Financial Inclusion to ensure access to financial services.',
        category: 'Finance',
        state: null,
        minAge: 10,
        maxAge: null,
        maxIncome: null,
        gender: 'ALL',
        occupation: null,
        benefits: 'Accidental insurance cover of Rs. 2 lakh, Overdraft facility up to Rs. 10,000.',
        documentsRequired: ['Aadhaar Card', 'Identity Proof', 'Address Proof'],
        applicationUrl: 'https://pmjdy.gov.in/',
        ministry: 'Ministry of Finance',
      },
      {
        title: 'Ayushman Bharat Yojana (PMJAY)',
        slug: 'ayushman-bharat-yojana',
        description: 'National health insurance scheme to provide free access to healthcare.',
        category: 'Health',
        state: null,
        minAge: null,
        maxAge: null,
        maxIncome: 250000,
        gender: 'ALL',
        occupation: null,
        benefits: 'Health cover of Rs. 5 lakhs per family per year.',
        documentsRequired: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
        applicationUrl: 'https://pmjay.gov.in/',
        ministry: 'Ministry of Health and Family Welfare',
      },
      {
        title: 'Pradhan Mantri Awas Yojana (PMAY)',
        slug: 'pradhan-mantri-awas-yojana',
        description: 'Affordable housing scheme for the urban poor.',
        category: 'Housing',
        state: null,
        minAge: 18,
        maxAge: 70,
        maxIncome: 1800000,
        gender: 'ALL',
        occupation: null,
        benefits: 'Credit linked subsidy on home loans.',
        documentsRequired: ['Aadhaar Card', 'Income Proof', 'Address Proof'],
        applicationUrl: 'https://pmaymis.gov.in/',
        ministry: 'Ministry of Housing and Urban Affairs',
      },
      {
        title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        slug: 'pm-kisan-samman-nidhi',
        description: 'Income support to all farmers.',
        category: 'Agriculture',
        state: null,
        minAge: 18,
        maxAge: null,
        maxIncome: null,
        gender: 'ALL',
        occupation: 'Farmer',
        benefits: 'Rs. 6,000 per year in three equal installments.',
        documentsRequired: ['Aadhaar Card', 'Bank Account Details', 'Land Ownership Records'],
        applicationUrl: 'https://pmkisan.gov.in/',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
      },
      {
        title: 'Sukanya Samriddhi Yojana (SSY)',
        slug: 'sukanya-samriddhi-yojana',
        description: 'Saving scheme targeted at parents of girl children.',
        category: 'Women & Child',
        state: null,
        minAge: 0,
        maxAge: 10,
        maxIncome: null,
        gender: 'FEMALE',
        occupation: null,
        benefits: 'High interest rate on savings, tax benefits under Section 80C.',
        documentsRequired: ['Birth Certificate of Child', 'Identity Proof of Parent'],
        applicationUrl: 'https://www.indiapost.gov.in/',
        ministry: 'Ministry of Finance',
      },
      {
        title: 'Atal Pension Yojana (APY)',
        slug: 'atal-pension-yojana',
        description: 'Pension scheme for unorganized sector workers.',
        category: 'Pension',
        state: null,
        minAge: 18,
        maxAge: 40,
        maxIncome: null,
        gender: 'ALL',
        occupation: null,
        benefits: 'Guaranteed minimum pension of Rs. 1000 to Rs. 5000 per month.',
        documentsRequired: ['Aadhaar Card', 'Bank Account Details'],
        applicationUrl: 'https://npscra.nsdl.co.in/',
        ministry: 'Ministry of Finance',
      },
      {
        title: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        slug: 'pradhan-mantri-ujjwala-yojana',
        description: 'LPG connection scheme for women.',
        category: 'Social Welfare',
        state: null,
        minAge: 18,
        maxAge: null,
        maxIncome: 100000,
        gender: 'FEMALE',
        occupation: null,
        benefits: 'Free LPG connection.',
        documentsRequired: ['BPL Ration Card', 'Aadhaar Card'],
        applicationUrl: 'https://www.pmuy.gov.in/',
        ministry: 'Ministry of Petroleum and Natural Gas',
      },
      {
        title: 'Pradhan Mantri Mudra Yojana',
        slug: 'pradhan-mantri-mudra-yojana',
        description: 'Business loan scheme for entrepreneurs.',
        category: 'Business & Entrepreneurship',
        state: null,
        minAge: 18,
        maxAge: null,
        maxIncome: null,
        gender: 'ALL',
        occupation: 'Entrepreneur',
        benefits: 'Loans up to Rs. 10 Lakhs.',
        documentsRequired: ['Identity Proof', 'Business Plan'],
        applicationUrl: 'https://www.mudra.org.in/',
        ministry: 'Ministry of Finance',
      },
      {
        title: 'MGNREGA',
        slug: 'mgnrega',
        description: 'Rural employment guarantee scheme.',
        category: 'Employment',
        state: null,
        minAge: 18,
        maxAge: null,
        maxIncome: null,
        gender: 'ALL',
        occupation: null,
        benefits: '100 days of wage employment in a financial year.',
        documentsRequired: ['Aadhaar Card', 'Job Card Application'],
        applicationUrl: 'https://nrega.nic.in/',
        ministry: 'Ministry of Rural Development',
      },
      {
        title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        slug: 'pm-kaushal-vikas-yojana',
        description: 'Skill development scheme.',
        category: 'Education & Training',
        state: null,
        minAge: 15,
        maxAge: 45,
        maxIncome: null,
        gender: 'ALL',
        occupation: 'Unemployed',
        benefits: 'Free skill training and certification.',
        documentsRequired: ['Aadhaar Card', 'Education Certificate'],
        applicationUrl: 'https://www.pmkvyofficial.org/',
        ministry: 'Ministry of Skill Development',
      },
    ];

    await Scheme.insertMany(schemes);
    console.log(`✅ Created ${schemes.length} sample schemes\n`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();
